import dotenv from "dotenv";
dotenv.config();

const provider = String(process.env.AI_PROVIDER || "ollama").trim().toLowerCase();
if (!["ollama", "openrouter"].includes(provider)) {
  throw new Error(`Unsupported AI_PROVIDER: ${provider}. Use "ollama" or "openrouter".`);
}
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
  console.warn("AI_PROVIDER is openrouter, but OPENROUTER_API_KEY is not configured.");
}

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
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Ollama returned empty message content.");
  }
  return content.trim();
}

async function requestOpenRouter(messages, options) {
  if (!config.apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const body = {
    model: config.model,
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
    throw new Error(`OpenRouter request failed (${response.status}): ${message}${metadata}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenRouter returned empty message content.");
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
  const content = config.provider === "openrouter"
    ? await requestOpenRouter(messages, options)
    : await requestOllama(messages, options);

  try { return parseJson(content); }
  catch (error) {
    throw new Error(`The ${config.provider} model returned invalid JSON: ${content.slice(0, 500)}`);
  }
}
