import { generateText, generateStructuredResponse, getLlmConfig } from "../services/llmProvider.js";
import { getAvailableFreeModels } from "./agentModelDiscovery.js";

const MAX_MODEL_ATTEMPTS = Math.max(1, Number(process.env.AGENT_MAX_MODEL_ATTEMPTS || 4));

export class AgentLlmUnavailableError extends Error {
  constructor(operation, attempts, cause, attemptedModels = []) {
    super(`No usable OpenRouter free model response after ${attempts} attempt(s).`);
    this.name = "AgentLlmUnavailableError";
    this.code = "AGENT_LLM_UNAVAILABLE";
    this.source = "external_llm_provider";
    this.operation = operation;
    this.attempts = attempts;
    this.cause = cause;
    this.attemptedModels = attemptedModels;
  }
}

export function createAgentLlmSession({ onStatus } = {}) {
  const config = getLlmConfig();
  const failedModels = new Set();
  let preferredModel = config.model;
  let totalAttempts = 0;

  async function run(operation, request, structured) {
    // Ollama remains the local-development provider; no OpenRouter discovery/failover.
    if (config.provider !== "openrouter") {
      return structured ? generateStructuredResponse(request) : generateText(request);
    }

    let lastError;
    let attempts = 0;
    let model = failedModels.has(preferredModel) ? null : preferredModel;

    while (attempts < MAX_MODEL_ATTEMPTS) {
      if (!model || failedModels.has(model)) {
        let candidates;
        try {
          candidates = await getAvailableFreeModels({
            requireJson: structured,
            exclude: [...failedModels]
          });
        } catch (error) {
          lastError = error;
          break;
        }
        model = candidates.find(candidate => !failedModels.has(candidate.id))?.id;
      }

      if (!model) break;
      attempts += 1;
      totalAttempts += 1;

      try {
        const result = structured
          ? await generateStructuredResponse({ ...request, model })
          : await generateText({ ...request, model });
        preferredModel = model;
        if (model !== config.model) {
          onStatus?.({ state: "recovered", message: "We've connected to another AI model. Your learning session is continuing.", model });
        }
        return result;
      } catch (error) {
        lastError = error;
        // OpenRouter aliases may route to a concrete model; exclude the actual model
        // returned by the API as well as the requested ID.
        failedModels.add(model);
        if (error.modelId) failedModels.add(error.modelId);
        console.warn("[Agent LLM] Model failed:", {
          operation,
          requestedModel: model,
          actualModel: error.modelId || model,
          error: error.message
        });

        if (attempts >= MAX_MODEL_ATTEMPTS) break;
        onStatus?.({
          state: "switching",
          message: "The current AI model is temporarily unavailable. We're finding another free AI model to continue your learning session."
        });
        model = null;
      }
    }

    throw new AgentLlmUnavailableError(operation, totalAttempts, lastError, [...failedModels]);
  }

  return {
    generateText: request => run("text_generation", request, false),
    generateStructuredResponse: request => run("structured_generation", request, true)
  };
}
