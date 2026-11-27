import { generateText, generateStructuredResponse, getLlmConfig, getLlmRuntimeStatus } from "../services/llmProvider.js";

/** Agentic status/error adapter. Model discovery and selection are centralised in the shared provider. */
export class AgentLlmUnavailableError extends Error {
  constructor(operation, attempts, cause, options = {}) {
    super(options.userMessage || cause?.message || `The AI provider is unavailable for ${operation}.`);
    this.name = "AgentLlmUnavailableError";
    this.code = "AGENT_LLM_UNAVAILABLE";
    this.source = "external_llm_provider";
    this.operation = operation;
    this.attempts = attempts;
    this.cause = cause;
    this.accountLimit = options.accountLimit === true;
    this.failureType = cause?.failureType || (this.accountLimit ? "account_rate_limit" : "provider_unavailable");
    this.rawContent = cause?.rawContent ?? null;
    this.finishReason = cause?.finishReason ?? null;
    this.modelId = cause?.modelId ?? null;
    this.maxTokens = cause?.maxTokens ?? null;
    this.provider = cause?.provider ?? null;
    this.usage = cause?.usage ?? null;
  }
}

function isAccountLimit(error) {
  const source = String(error?.metadata?.limit_source || "").toLowerCase();
  const message = `${error?.providerMessage || ""} ${error?.message || ""}`.toLowerCase();
  return source.includes("openrouter_free_tier") || message.includes("free-models-per-day") || message.includes("free model requests per day");
}

export function createAgentLlmSession({ onStatus } = {}) {
  const config = getLlmConfig();
  let attemptsUsed = 0;

  async function run(operation, request, structured) {
    attemptsUsed += 1;
    try {
      const result = structured ? await generateStructuredResponse(request) : await generateText(request);
      const runtime = getLlmRuntimeStatus();
      onStatus?.({ state: "connected", message: "AI connection is ready.", model: runtime.model || config.model });
      return result;
    } catch (error) {
      if (structured && ["invalid_json", "output_truncated"].includes(error?.failureType)) throw error;
      const accountLimit = isAccountLimit(error);
      const unavailable = new AgentLlmUnavailableError(operation, attemptsUsed, error, {
        accountLimit,
        userMessage: accountLimit
          ? "The AI service has reached its free daily usage limit. Please try again after the provider's limit resets."
          : error?.message || "The AI provider is temporarily unavailable."
      });
      onStatus?.({ state: "unavailable", message: unavailable.message, code: unavailable.code });
      throw unavailable;
    }
  }

  return {
    generateText: request => run("text_generation", request, false),
    generateStructuredResponse: request => run("structured_generation", request, true),
    getAttemptsUsed: () => attemptsUsed
  };
}

// Retained for compatibility; selection state now belongs to the shared provider.
export function resetAgentLlmRuntimeStateForTests() {}
