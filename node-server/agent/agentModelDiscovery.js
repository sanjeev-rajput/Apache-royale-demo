import { getLlmConfig } from "../services/llmProvider.js";

const CACHE_TTL_MS = 15 * 60 * 1000;
const MIN_CONTEXT_TOKENS = 8192;
let cachedModels = [];
let cacheExpiresAt = 0;
let refreshPromise = null;

function isZero(value) {
  return value !== undefined && value !== null && Number(value) === 0;
}

function isExpired(model) {
  if (!model.expiration_date) return false;
  const expiry = Date.parse(model.expiration_date);
  return Number.isFinite(expiry) && expiry <= Date.now();
}

function isFreeTextModel(model, requireJson) {
  const architecture = model.architecture || {};
  const input = architecture.input_modalities || [];
  const output = architecture.output_modalities || [];
  const parameters = model.supported_parameters || [];
  const pricing = model.pricing || {};

  if (!model.id || !input.includes("text") || !output.includes("text")) return false;
  if (!isZero(pricing.prompt) || !isZero(pricing.completion)) return false;
  // A non-zero fixed request charge means this is not a free request.
  if (pricing.request !== undefined && !isZero(pricing.request)) return false;
  if (Array.isArray(pricing.overrides) && pricing.overrides.some(override =>
      (override.prompt !== undefined && !isZero(override.prompt)) ||
      (override.completion !== undefined && !isZero(override.completion)) ||
      (override.request !== undefined && !isZero(override.request)))) return false;
  if (Number(model.context_length || 0) < MIN_CONTEXT_TOKENS) return false;
  if (isExpired(model)) return false;
  // Structured Agent operations require response_format support.
  if (requireJson && !parameters.includes("response_format")) return false;
  return true;
}

async function fetchModels() {
  const { provider } = getLlmConfig();
  if (provider !== "openrouter") return [];
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const url = "https://openrouter.ai/api/v1/models?input_modalities=text&output_modalities=text&endpoints=%2Fapi%2Fv1%2Fchat%2Fcompletions&sort=most-popular";
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(Number(process.env.AGENT_MODEL_DISCOVERY_TIMEOUT_MS || 12000))
  });
  if (!response.ok) throw new Error(`OpenRouter model discovery failed (${response.status}).`);
  const payload = await response.json();
  if (!Array.isArray(payload?.data)) throw new Error("OpenRouter model discovery returned an invalid catalogue.");
  return payload.data;
}

export async function getAvailableFreeModels({ requireJson = false, exclude = [] } = {}) {
  const excluded = new Set(exclude.filter(Boolean));
  if (Date.now() >= cacheExpiresAt || !cachedModels.length) {
    if (!refreshPromise) {
      refreshPromise = fetchModels()
        .then(models => {
          cachedModels = models;
          cacheExpiresAt = Date.now() + CACHE_TTL_MS;
          console.log(`[Agent Model Discovery] Cached ${cachedModels.length} OpenRouter text models for 15 minutes.`);
        })
        .finally(() => { refreshPromise = null; });
    }
    try {
      await refreshPromise;
    } catch (error) {
      console.error("[Agent Model Discovery] Refresh failed; refusing to use potentially stale pricing data:", error.message);
      throw error;
    }
  }

  return cachedModels
    .filter(model => isFreeTextModel(model, requireJson) && !excluded.has(model.id))
    .map(model => ({ id: model.id, name: model.name || model.id, contextLength: model.context_length || 0 }))
    .slice(0, Number(process.env.AGENT_MAX_DISCOVERED_MODELS || 40));
}

export function clearAgentModelCacheForTests() {
  cachedModels = [];
  cacheExpiresAt = 0;
  refreshPromise = null;
}
