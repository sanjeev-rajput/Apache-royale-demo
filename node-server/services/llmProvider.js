// APP_ENV is the single source of truth for backend environment selection.
// LOCAL always uses Ollama; LIVE always uses OpenRouter.
const appEnvironment = String(process.env.APP_ENV || "").trim().toUpperCase();
if (!["LOCAL", "LIVE"].includes(appEnvironment)) {
  throw new Error(
    `Invalid or missing APP_ENV: "${appEnvironment}". Set APP_ENV=LOCAL or APP_ENV=LIVE.`
  );
}

const provider = appEnvironment === "LOCAL" ? "ollama" : "openrouter";
const timeoutDefault = Number(process.env.AI_TIMEOUT_MS || 60000);

const config = provider === "openrouter"
  ? {
      provider,
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      url: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions",
      apiKey: process.env.OPENROUTER_API_KEY || ""
    }
  : {
      provider: "ollama",
      model: process.env.OLLAMA_MODEL || "qwen3.5:4b",
      url: process.env.OLLAMA_URL || "http://localhost:11434/api/chat"
    };

if (config.provider === "openrouter" && !config.apiKey) {
  console.warn("APP_ENV=LIVE selects OpenRouter, but OPENROUTER_API_KEY is not configured.");
}
console.log(`[LLM] APP_ENV=${appEnvironment}; provider=${config.provider}; model=${config.model}`);

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
  const requestedModel = config.model;
  if (!config.apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const body = {
    model: requestedModel,
    messages,
    temperature: options.temperature,
    max_tokens: options.maxTokens
  };
  if (options.json) body.response_format = { type: "json_object" };

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Royale-K12-Tutor"
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(options.timeoutMs)
  });

  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error(`OpenRouter returned non-JSON (${response.status}): ${raw.slice(0, 1200)}`); }

  if (!response.ok || data.error) {
    const message = data.error?.message || `HTTP ${response.status}`;
    const metadata = data.error?.metadata ? `; metadata: ${JSON.stringify(data.error.metadata)}` : "";
    const error = new Error(`OpenRouter request failed (${response.status}): ${message}${metadata}`);
    error.modelId = data?.model || requestedModel;
    error.status = response.status;
    error.metadata = data.error?.metadata || null;
    error.providerMessage = message;
    error.rateLimitReset = response.headers.get("X-RateLimit-Reset");
    throw error;
  }

  const choice = data.choices?.[0];
  const finishReason = choice?.finish_reason || null;
  const content = choice?.message?.content;
  if (finishReason === "length") {
    const error = new Error(`OpenRouter output was truncated (finish_reason=length; requested max_tokens=${options.maxTokens}).`);
    Object.assign(error, {
      modelId: data?.model || requestedModel,
      status: response.status,
      finishReason,
      failureType: "output_truncated",
      maxTokens: options.maxTokens,
      rawContent: typeof content === "string" ? content : "",
      usage: data.usage || null,
      provider: "openrouter"
    });
    throw error;
  }
  if (typeof content !== "string" || !content.trim()) {
    const error = new Error("OpenRouter returned empty message content.");
    error.modelId = data?.model || requestedModel;
    error.status = response.status;
    error.finishReason = finishReason;
    error.failureType = "empty_content";
    error.rawContent = typeof content === "string" ? content : "";
    error.usage = data.usage || null;
    error.provider = "openrouter";
    throw error;
  }
  return content.trim();
}

export function getLlmConfig() {
  return { provider: config.provider, model: config.model };
}

export async function generateText({ messages, temperature = 0.4, maxTokens = 500, timeoutMs = timeoutDefault }) {
  const options = { temperature, maxTokens, timeoutMs, json: false };
  return config.provider === "openrouter"
    ? requestOpenRouter(messages, options)
    : requestOllama(messages, options);
}

export async function generateStructuredResponse({
  systemPrompt,
  userPayload,
  temperature = 0,
  maxTokens = 450,
  timeoutMs = timeoutDefault
}) {
  const messages = [
    { role: "system", content: `${systemPrompt}\nReturn one valid JSON object only. Do not include Markdown fences or commentary.` },
    { role: "user", content: typeof userPayload === "string" ? userPayload : JSON.stringify(userPayload) }
  ];
  const options = { temperature, maxTokens, timeoutMs, json: true };
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
    error.modelId = config.model;
    error.provider = config.provider;
    error.failureType = "invalid_json";
    error.rawContent = content;
    error.cause = cause;
    throw error;
  }
}
