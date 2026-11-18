import { generateText, generateStructuredResponse, getLlmConfig } from "../services/llmProvider.js";
import { getAvailableFreeModels } from "./agentModelDiscovery.js";

const MAX_MODEL_ATTEMPTS = Math.max(1, Number(process.env.AGENT_MAX_MODEL_ATTEMPTS || 4));

// Provider-health state is shared by requests in this Node process. It is
// intentionally in-memory only: a restart clears it; no learner data is stored.
const runtimeState = {
  preferredModel: null,
  failedModels: new Set()
};

function isAccountLevelRateLimit(error) {
  if (Number(error?.status) !== 429) return false;
  const metadata = error?.metadata || {};
  const source = String(metadata.limit_source || "").toLowerCase();
  const message = `${error?.providerMessage || ""} ${error?.message || ""}`.toLowerCase();
  return source.includes("openrouter_free_tier") ||
    message.includes("free-models-per-day") ||
    message.includes("free model requests per day") ||
    message.includes("free-models-per-day");
}

function accountLimitMessage(error) {
  const metadata = error?.metadata || {};
  const reset = error?.rateLimitReset;
  let resetText = "";
  if (reset && Number.isFinite(Number(reset))) {
    const date = new Date(Number(reset));
    if (!Number.isNaN(date.getTime())) resetText = ` The provider indicates a reset at ${date.toLocaleString()}.`;
  }
  return `The AI service has reached its free daily usage limit. Please try again after the provider's limit resets.${resetText}`;
}

export class AgentLlmUnavailableError extends Error {
  constructor(operation, attempts, cause, attemptedModels = [], options = {}) {
    super(options.userMessage || `No usable OpenRouter free model response after ${attempts} attempt(s).`);
    this.name = "AgentLlmUnavailableError";
    this.code = "AGENT_LLM_UNAVAILABLE";
    this.source = "external_llm_provider";
    this.operation = operation;
    this.attempts = attempts;
    this.cause = cause;
    this.attemptedModels = attemptedModels;
    this.accountLimit = options.accountLimit === true;
    this.failureType = cause?.failureType || (this.accountLimit ? "account_rate_limit" : "provider_unavailable");
  }
}

export function createAgentLlmSession({ onStatus } = {}) {
  const config = getLlmConfig();
  if (!runtimeState.preferredModel) runtimeState.preferredModel = config.model;

  // One budget and one temporary exclusion set are shared by every operation
  // performed through this session (planner, fit assessment and final answer).
  let attemptsUsed = 0;
  const requestFailedModels = new Set();

  async function run(operation, request, structured) {
    if (config.provider !== "openrouter") {
      return structured ? generateStructuredResponse(request) : generateText(request);
    }

    let lastError;
    let model = runtimeState.failedModels.has(runtimeState.preferredModel)
      ? null : runtimeState.preferredModel;

    while (attemptsUsed < MAX_MODEL_ATTEMPTS) {
      if (!model || runtimeState.failedModels.has(model) || requestFailedModels.has(model)) {
        let candidates;
        try {
          candidates = await getAvailableFreeModels({
            requireJson: structured,
            exclude: [...runtimeState.failedModels, ...requestFailedModels]
          });
        } catch (error) {
          lastError = error;
          break;
        }
        model = candidates.find(candidate =>
          !runtimeState.failedModels.has(candidate.id) &&
          !requestFailedModels.has(candidate.id)
        )?.id;
      }

      if (!model) break;
      attemptsUsed += 1;

      try {
        const result = structured
          ? await generateStructuredResponse({ ...request, model })
          : await generateText({ ...request, model });
        runtimeState.preferredModel = model;
        onStatus?.({
          state: "connected",
          message: "AI connection is ready.",
          model
        });
        return result;
      } catch (error) {
        lastError = error;
        if (isAccountLevelRateLimit(error)) {
          const unavailable = new AgentLlmUnavailableError(
            operation, attemptsUsed, error,
            [...runtimeState.failedModels, ...requestFailedModels],
            { accountLimit: true, userMessage: accountLimitMessage(error) }
          );
          onStatus?.({ state: "unavailable", message: unavailable.message, code: unavailable.code });
          throw unavailable; // Account-level limit: do not try another model.
        }

        const failedModel = error.modelId || model;
        requestFailedModels.add(model);
        requestFailedModels.add(failedModel);

        // Empty content and invalid JSON indicate a model-specific unusable
        // response. Exclude that model for this server runtime.
        if (["empty_content", "invalid_json"].includes(error.failureType)) {
          runtimeState.failedModels.add(model);
          runtimeState.failedModels.add(failedModel);
        }

        console.warn("[Agent LLM] Model attempt failed:", {
          operation,
          requestedModel: model,
          actualModel: failedModel,
          failureType: error.failureType || "request_error",
          status: error.status,
          finishReason: error.finishReason,
          maxTokens: error.maxTokens,
          error: error.message
        });

        if (attemptsUsed >= MAX_MODEL_ATTEMPTS) break;
        onStatus?.({
          state: "switching",
          message: "The current AI model did not return a usable response. We're trying another available free model."
        });
        model = null;
      }
    }

    throw new AgentLlmUnavailableError(
      operation, attemptsUsed, lastError,
      [...runtimeState.failedModels, ...requestFailedModels]
    );
  }

  return {
    generateText: request => run("text_generation", request, false),
    generateStructuredResponse: request => run("structured_generation", request, true),
    getAttemptsUsed: () => attemptsUsed
  };
}

// Exposed only to allow isolated automated tests to reset process memory.
export function resetAgentLlmRuntimeStateForTests() {
  runtimeState.preferredModel = null;
  runtimeState.failedModels.clear();
}
