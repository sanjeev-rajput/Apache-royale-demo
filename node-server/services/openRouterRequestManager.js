/**
 * Central OpenRouter chat-completion gateway.
 * Counts every outbound chat-completion attempt before network I/O (including
 * failed requests), applies a conservative process-local daily budget, and
 * prevents repeated calls while the provider is known to be unavailable.
 *
 * This is intentionally not a durable/account-wide quota ledger. OpenRouter's
 * own limits remain authoritative; a process restart resets this local state.
 */

const DEFAULT_DAILY_BUDGET = 40;
const DEFAULT_TIMEOUT_MS = 60_000;
const TRANSIENT_COOLDOWN_MS = 60_000;
const MAX_CONSECUTIVE_FAILURES = 3;

let usageDay = utcDayKey();
let requestsToday = 0;
let consecutiveFailures = 0;
let circuit = { state: "closed", reason: null, until: 0, resetAt: null };

function utcDayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

function nextUtcMidnight(now = Date.now()) {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
}

function currentBudget() {
  const parsed = Number(process.env.OPENROUTER_DAILY_REQUEST_BUDGET ?? DEFAULT_DAILY_BUDGET);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : DEFAULT_DAILY_BUDGET;
}

function rollDayIfNeeded() {
  const today = utcDayKey();
  if (today !== usageDay) {
    usageDay = today;
    requestsToday = 0;
    if (circuit.reason === "application_daily_budget" || circuit.reason === "provider_daily_limit") {
      circuit = { state: "closed", reason: null, until: 0, resetAt: null };
    }
  }
}

function makeError(message, code, details = {}) {
  const error = new Error(message);
  error.name = "LlmProviderError";
  error.code = code;
  error.provider = "openrouter";
  Object.assign(error, details);
  return error;
}

function isDailyLimit(status, metadata, message) {
  if (status !== 429) return false;
  const source = String(metadata?.limit_source || "").toLowerCase();
  const text = String(message || "").toLowerCase();
  return source.includes("openrouter_free_tier") ||
    text.includes("free-models-per-day") ||
    text.includes("free model requests per day") ||
    text.includes("free-models-per-day");
}

function parseReset(headers, metadata) {
  const raw = headers?.get?.("X-RateLimit-Reset") ||
    headers?.get?.("RateLimit-Reset") || metadata?.reset_at || null;
  if (!raw) return null;
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    // OpenRouter commonly supplies Unix seconds; tolerate milliseconds too.
    return numeric < 10_000_000_000 ? numeric * 1000 : numeric;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function activateCircuit(reason, until = 0, resetAt = null) {
  circuit = { state: "open", reason, until, resetAt };
}

function assertCircuitClosed() {
  if (circuit.state !== "open") return;
  const retryAt = circuit.until || circuit.resetAt || 0;
  if (retryAt && Date.now() >= retryAt) {
    circuit = { state: "closed", reason: null, until: 0, resetAt: null };
    consecutiveFailures = 0;
    return;
  }
  throw makeError(
    "OpenRouter requests are temporarily paused because the provider is unavailable.",
    "OPENROUTER_CIRCUIT_OPEN",
    { failureType: circuit.reason, retryAt: circuit.until || circuit.resetAt || null, retryable: false }
  );
}

function reserveRequest() {
  rollDayIfNeeded();
  const budget = currentBudget();
  if (requestsToday >= budget) {
    activateCircuit("application_daily_budget", nextUtcMidnight());
    throw makeError(
      `The application's OpenRouter daily request budget (${budget}) has been reached.`,
      "OPENROUTER_APP_BUDGET_EXHAUSTED",
      { failureType: "application_daily_budget", requestsToday, dailyBudget: budget, retryable: false }
    );
  }
  requestsToday += 1; // Reserve before network I/O; failures count conservatively.
}

export function getOpenRouterRequestStatus() {
  rollDayIfNeeded();
  return {
    requestsToday,
    dailyBudget: currentBudget(),
    remaining: Math.max(0, currentBudget() - requestsToday),
    usageDay,
    circuit: { ...circuit },
    consecutiveFailures
  };
}

export async function requestOpenRouterChatCompletion({
  body,
  apiKey = process.env.OPENROUTER_API_KEY || "",
  url = process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions",
  timeoutMs = Number(process.env.AI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
  title = "Royale-K12-Tutor",
  fetchImpl = globalThis.fetch
} = {}) {
  const appEnvironment = String(process.env.APP_ENV || "").trim().toUpperCase();
  if (appEnvironment !== "LIVE") {
    throw makeError("OpenRouter requests are disabled unless APP_ENV=LIVE.", "OPENROUTER_WRONG_ENVIRONMENT", {
      failureType: "configuration", retryable: false
    });
  }
  if (!apiKey) {
    activateCircuit("missing_api_key");
    throw makeError("OPENROUTER_API_KEY is not configured.", "OPENROUTER_NOT_CONFIGURED", {
      failureType: "configuration", retryable: false
    });
  }
  if (typeof fetchImpl !== "function") {
    throw makeError("No fetch implementation is available for OpenRouter.", "FETCH_UNAVAILABLE", {
      failureType: "configuration", retryable: false
    });
  }

  assertCircuitClosed();
  reserveRequest();

  let response;
  let raw = "";
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": title
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS)
    });
    raw = await response.text();
  } catch (cause) {
    consecutiveFailures += 1;
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      activateCircuit("transient_provider_failure", Date.now() + TRANSIENT_COOLDOWN_MS);
    }
    throw makeError("OpenRouter could not be reached or the request timed out.", "OPENROUTER_NETWORK_ERROR", {
      failureType: cause?.name === "TimeoutError" || cause?.name === "AbortError" ? "timeout" : "network_error",
      cause, retryable: false
    });
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (cause) {
    consecutiveFailures += 1;
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) activateCircuit("transient_provider_failure", Date.now() + TRANSIENT_COOLDOWN_MS);
    throw makeError(`OpenRouter returned a non-JSON response (HTTP ${response.status}).`, "OPENROUTER_INVALID_ENVELOPE", {
      failureType: "invalid_response", status: response.status, rawResponse: raw.slice(0, 1200), cause, retryable: false
    });
  }

  if (!response.ok || data?.error) {
    const status = Number(response.status || data?.error?.code || 0);
    const message = data?.error?.message || `HTTP ${status}`;
    const metadata = data?.error?.metadata || null;
    const resetAt = parseReset(response.headers, metadata);

    if (status === 401 || status === 403) activateCircuit("authentication", 0, null);
    else if (status === 402) activateCircuit("payment_required", 0, null);
    else if (isDailyLimit(status, metadata, message)) {
      const providerReset = resetAt || nextUtcMidnight();
      activateCircuit("provider_daily_limit", providerReset, providerReset);
    }
    else if (status === 429) {
      const retryAfter = Number(response.headers?.get?.("Retry-After"));
      const retryAt = resetAt || (Number.isFinite(retryAfter) && retryAfter > 0 ? Date.now() + retryAfter * 1000 : Date.now() + TRANSIENT_COOLDOWN_MS);
      activateCircuit("provider_rate_limit", retryAt, resetAt);
    }
    else if (status >= 500) {
      consecutiveFailures += 1;
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) activateCircuit("transient_provider_failure", Date.now() + TRANSIENT_COOLDOWN_MS);
    }

    throw makeError(`OpenRouter request failed (${status}): ${message}`, "OPENROUTER_HTTP_ERROR", {
      status, metadata, providerMessage: message, rateLimitReset: response.headers?.get?.("X-RateLimit-Reset") || null,
      failureType: isDailyLimit(status, metadata, message) ? "account_rate_limit" : status === 429 ? "rate_limit" : status === 402 ? "payment_required" : status === 401 || status === 403 ? "authentication" : [400, 404, 422].includes(status) ? "model_request_rejected" : "provider_error",
      // Only model/request compatibility errors may try one of the other
      // already-discovered free models. Quota, auth, payment, network and 5xx
      // failures are provider-wide and must not trigger another prompt.
      retryable: [400, 404, 422].includes(status)
    });
  }

  consecutiveFailures = 0;
  const choice = data?.choices?.[0];
  const content = choice?.message?.content;
  const finishReason = choice?.finish_reason || null;
  const modelId = data?.model || body?.model || null;

  if (finishReason === "length") {
    throw makeError("OpenRouter output was truncated.", "OPENROUTER_OUTPUT_TRUNCATED", {
      failureType: "output_truncated", modelId, finishReason, rawContent: typeof content === "string" ? content : "", usage: data.usage || null, retryable: false
    });
  }
  if (typeof content !== "string" || !content.trim()) {
    throw makeError("OpenRouter returned empty message content.", "OPENROUTER_EMPTY_CONTENT", {
      failureType: "empty_content", modelId, finishReason, rawContent: typeof content === "string" ? content : "", usage: data.usage || null, retryable: false
    });
  }

  return {
    content: content.trim(),
    modelId,
    finishReason,
    usage: data.usage || null,
    response: data
  };
}

export function resetOpenRouterRequestStateForTests() {
  usageDay = utcDayKey();
  requestsToday = 0;
  consecutiveFailures = 0;
  circuit = { state: "closed", reason: null, until: 0, resetAt: null };
}
