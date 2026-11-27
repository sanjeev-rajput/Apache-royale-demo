import { requestOpenRouterChatCompletion, getOpenRouterRequestStatus } from "./openRouterRequestManager.js";
import { getSelectedFreeModel, markFreeModelUnavailable, isCapabilityCompatibilityError, getFreeModelSelectionStatus } from "./openRouterModelManager.js";

// APP_ENV selects the provider, but a configuration problem must never prevent
// Express from starting: non-LLM routes (catalogue, YouTube, Question Bank) must
// remain available even when the optional AI service is misconfigured.
const appEnvironment = String(process.env.APP_ENV || "").trim().toUpperCase();
const validEnvironment = ["LOCAL", "LIVE"].includes(appEnvironment);
const provider = !validEnvironment ? "disabled" : appEnvironment === "LOCAL" ? "ollama" : "openrouter";
const timeoutDefault = Number(process.env.AI_TIMEOUT_MS || 60000);

const config = provider === "openrouter"
  ? {
      provider,
      model: "auto-free",
      url: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions",
      apiKey: process.env.OPENROUTER_API_KEY || ""
    }
  : provider === "ollama"
    ? {
        provider: "ollama",
        model: process.env.OLLAMA_MODEL || "qwen3.5:4b",
        url: process.env.OLLAMA_URL || "http://localhost:11434/api/chat"
      }
    : { provider: "disabled", model: null, reason: `Invalid or missing APP_ENV: "${appEnvironment}". Set APP_ENV=LOCAL or APP_ENV=LIVE.` };

if (config.provider === "openrouter" && !config.apiKey) {
  console.warn("APP_ENV=LIVE selects OpenRouter, but OPENROUTER_API_KEY is not configured.");
}
if (config.provider === "disabled") console.error(`[LLM] ${config.reason} AI features are disabled; non-LLM services remain available.`);
console.log(`[LLM] APP_ENV=${appEnvironment || "(missing)"}; provider=${config.provider}; model=${config.model || "none"}`);

function parseJson(content) {
  const cleaned = String(content || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

async function requestOllama(messages, options) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: false,
      think: false,
      ...(options.json ? { format: "json" } : {}),
      options: {
        temperature: options.temperature,
        num_predict: options.maxTokens
      }
    }),
    signal: AbortSignal.timeout(options.timeoutMs)
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Ollama request failed (${response.status}): ${raw.slice(0, 1200)}`);
  }

  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error("Ollama returned an invalid JSON response envelope."); }

  const content = data.message?.content;
  const metadata = {
    provider: "ollama",
    modelId: data.model || config.model,
    finishReason: data.done_reason || null,
    promptTokens: data.prompt_eval_count ?? null,
    completionTokens: data.eval_count ?? null,
    totalDuration: data.total_duration ?? null
  };
  if (typeof content !== "string" || !content.trim()) {
    const error = new Error("Ollama returned empty message content.");
    Object.assign(error, metadata, { failureType: "empty_content", rawContent: content ?? "" });
    throw error;
  }
  if (options.json && ["length", "max_tokens"].includes(String(data.done_reason || "").toLowerCase())) {
    const error = new Error(`Ollama output may be truncated (done_reason=${data.done_reason}).`);
    Object.assign(error, metadata, { failureType: "output_truncated", maxTokens: options.maxTokens, rawContent: content });
    throw error;
  }
  return content.trim();
}

async function requestOpenRouter(messages, options) {
  // The provider owns model discovery/selection. Callers cannot pin a paid or
  // stale model by passing a model argument into generateText/generateStructuredResponse.
  const selected = await getSelectedFreeModel({ requireJson: options.json });
  options.selectedModelId = selected.id;
  try {
    const result = await requestOpenRouterChatCompletion({
      body: {
        model: selected.id,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        ...(options.json ? { response_format: { type: "json_object" } } : {})
      },
      url: config.url,
      apiKey: config.apiKey,
      timeoutMs: options.timeoutMs,
      title: "Royale-K12-Tutor"
    });
    return result.content;
  } catch (error) {
    // Do not burn additional prompts in the same operation. The next request
    // will centrally select another eligible free model after a model-specific rejection.
    if (Number(error?.status) === 404) {
      markFreeModelUnavailable(selected.id, "HTTP 404", { global: true });
    } else if (isCapabilityCompatibilityError(error, options.json ? "json" : "text")) {
      markFreeModelUnavailable(selected.id, `HTTP 422 capability incompatibility (${options.json ? "json" : "text"})`, { capability: options.json ? "json" : "text" });
    }
    throw error;
  }
}

function assertProviderAvailable() {
  if (config.provider === "disabled") {
    const error = new Error(config.reason);
    error.name = "LlmProviderUnavailableError";
    error.code = "LLM_PROVIDER_MISCONFIGURED";
    error.failureType = "configuration";
    error.retryable = false;
    throw error;
  }
}

export function getLlmConfig() {
  return { provider: config.provider, model: config.provider === "openrouter" ? "auto-free" : config.model };
}

export function getLlmRuntimeStatus() {
  return {
    provider: config.provider,
    model: config.provider === "openrouter" ? (getFreeModelSelectionStatus().selectedTextModel || getFreeModelSelectionStatus().selectedJsonModel || "auto-free") : config.model,
    modelSelection: config.provider === "openrouter" ? getFreeModelSelectionStatus() : null,
    available: config.provider !== "disabled" && !(config.provider === "openrouter" && (!config.apiKey || getOpenRouterRequestStatus().circuit.state === "open" || getOpenRouterRequestStatus().remaining <= 0)),
    configurationError: config.provider === "disabled" ? config.reason : config.provider === "openrouter" && !config.apiKey ? "OPENROUTER_API_KEY is not configured." : null,
    ...(config.provider === "openrouter" ? { openRouter: getOpenRouterRequestStatus() } : {})
  };
}

export async function generateText({ messages, temperature = 0.4, maxTokens = 500, timeoutMs = timeoutDefault, model }) {
  const options = { temperature, maxTokens, timeoutMs, json: false, model };
  assertProviderAvailable();
  return config.provider === "openrouter"
    ? requestOpenRouter(messages, options)
    : requestOllama(messages, options);
}

export async function generateStructuredResponse({
  systemPrompt,
  userPayload,
  temperature = 0,
  maxTokens = 450,
  timeoutMs = timeoutDefault,
  model
}) {
  const messages = [
    { role: "system", content: `${systemPrompt}\nReturn one valid JSON object only. Do not include Markdown fences or commentary.` },
    { role: "user", content: typeof userPayload === "string" ? userPayload : JSON.stringify(userPayload) }
  ];
  const options = { temperature, maxTokens, timeoutMs, json: true, model };
  assertProviderAvailable();
  let content;
  try {
    content = config.provider === "openrouter"
      ? await requestOpenRouter(messages, options)
      : await requestOllama(messages, options);
  } catch (error) {
    throw error;
  }

  try { return parseJson(content); }
  catch (cause) {
    const error = new Error(`The ${config.provider} model returned invalid JSON: ${content.slice(0, 500)}`);
    error.modelId = options.selectedModelId || model || config.model;
    error.provider = config.provider;
    error.failureType = "invalid_json";
    error.rawContent = content;
    error.cause = cause;
    throw error;
  }
}
