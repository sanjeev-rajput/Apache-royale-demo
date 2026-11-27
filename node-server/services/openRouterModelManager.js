/**
 * Central OpenRouter free-model discovery and selection.
 *
 * Discovery is metadata-only (GET /models); chat-completion prompts remain
 * accounted for by openRouterRequestManager.js. Selection is shared by every
 * feature using llmProvider.js, not owned by Agentic/Adaptive/AI K12 modules.
 */

const CACHE_TTL_MS = 15 * 60 * 1000;
const FAILED_MODEL_TTL_MS = 30 * 60 * 1000;
const MIN_CONTEXT_TOKENS = 8192;

let cachedModels = [];
let cacheExpiresAt = 0;
let refreshPromise = null;
const failedModelsUntil = new Map();
const failedCapabilitiesUntil = new Map();
const selectedByCapability = new Map();

function isZero(value) {
  return value !== undefined && value !== null && Number(value) === 0;
}

function isExpired(model, now = Date.now()) {
  if (!model.expiration_date) return false;
  const expiry = Date.parse(model.expiration_date);
  return Number.isFinite(expiry) && expiry <= now;
}

function isEligibleFreeModel(model, { requireJson = false, requireImage = false } = {}, now = Date.now()) {
  const architecture = model.architecture || {};
  const input = architecture.input_modalities || [];
  const output = architecture.output_modalities || [];
  const parameters = model.supported_parameters || [];
  const pricing = model.pricing || {};

  if (!model.id || !input.includes("text") || !output.includes("text")) return false;
  if (requireImage && !input.includes("image")) return false;
  if (!isZero(pricing.prompt) || !isZero(pricing.completion)) return false;
  if (pricing.request !== undefined && !isZero(pricing.request)) return false;
  if (Array.isArray(pricing.overrides) && pricing.overrides.some(item =>
    (item.prompt !== undefined && !isZero(item.prompt)) ||
    (item.completion !== undefined && !isZero(item.completion)) ||
    (item.request !== undefined && !isZero(item.request)))) return false;
  if (Number(model.context_length || 0) < MIN_CONTEXT_TOKENS) return false;
  if (isExpired(model, now)) return false;
  if (requireJson && !parameters.includes("response_format")) return false;
  return true;
}

function environment() {
  return String(process.env.APP_ENV || "").trim().toUpperCase();
}

async function refreshCatalogue(fetchImpl = globalThis.fetch) {
  if (environment() !== "LIVE") {
    throw new Error("OpenRouter model discovery is available only when APP_ENV=LIVE.");
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");
  if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable for OpenRouter model discovery.");

  const url = "https://openrouter.ai/api/v1/models?endpoints=%2Fapi%2Fv1%2Fchat%2Fcompletions&sort=most-popular";
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(Number(process.env.AGENT_MODEL_DISCOVERY_TIMEOUT_MS || 12000))
  });
  if (!response.ok) throw new Error(`OpenRouter model discovery failed (${response.status}).`);
  const payload = await response.json();
  if (!Array.isArray(payload?.data)) throw new Error("OpenRouter model discovery returned an invalid catalogue.");
  cachedModels = payload.data;
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
}

async function ensureCatalogue(fetchImpl) {
  if (Date.now() < cacheExpiresAt) return;
  if (!refreshPromise) {
    refreshPromise = refreshCatalogue(fetchImpl).finally(() => { refreshPromise = null; });
  }
  await refreshPromise;
}

export async function getAvailableFreeModels({ requireJson = false, requireImage = false, exclude = [], fetchImpl } = {}) {
  await ensureCatalogue(fetchImpl);
  const now = Date.now();
  for (const [id, until] of failedModelsUntil) {
    if (until <= now) failedModelsUntil.delete(id);
  }
  const capability = requireImage ? "image" : requireJson ? "json" : "text";
  const excluded = new Set([...exclude.filter(Boolean), ...failedModelsUntil.keys()]);
  const capabilityExcluded = failedCapabilitiesUntil.get(capability) || new Map();
  for (const [id, until] of capabilityExcluded) {
    if (until <= now) capabilityExcluded.delete(id);
  }
  return cachedModels
    .filter(model => isEligibleFreeModel(model, { requireJson, requireImage }, now) && !excluded.has(model.id) && !capabilityExcluded.has(model.id))
    .map(model => ({ id: model.id, name: model.name || model.id, contextLength: model.context_length || 0 }))
    .slice(0, Number.isFinite(Number(process.env.OPENROUTER_MAX_DISCOVERED_MODELS)) && Number(process.env.OPENROUTER_MAX_DISCOVERED_MODELS) > 0
      ? Math.floor(Number(process.env.OPENROUTER_MAX_DISCOVERED_MODELS)) : 40);
}

export async function getSelectedFreeModel({ requireJson = false, requireImage = false, fetchImpl } = {}) {
  const capability = requireImage ? "image" : requireJson ? "json" : "text";
  const candidates = await getAvailableFreeModels({ requireJson, requireImage, fetchImpl });
  if (!candidates.length) {
    const error = new Error(`No eligible free OpenRouter ${requireImage ? "image-capable" : requireJson ? "structured-output" : "text"} model is currently available.`);
    error.name = "FreeOpenRouterModelUnavailableError";
    error.code = "OPENROUTER_NO_FREE_MODEL";
    error.failureType = "model_unavailable";
    error.retryable = false;
    throw error;
  }
  const preferred = selectedByCapability.get(capability);
  const selected = candidates.find(model => model.id === preferred) || candidates[0];
  selectedByCapability.set(capability, selected.id);
  return selected;
}

/**
 * Exclude a model globally (404) or only for one capability (confirmed 422
 * incompatibility). Generic 422 request errors must not poison model selection.
 */
export function markFreeModelUnavailable(modelId, reason = "model_incompatible", { capability = null, global = false } = {}) {
  if (!modelId) return;
  const until = Date.now() + FAILED_MODEL_TTL_MS;
  if (global || !capability) {
    failedModelsUntil.set(modelId, until);
    for (const [selectedCapability, selected] of selectedByCapability) {
      if (selected === modelId) selectedByCapability.delete(selectedCapability);
    }
  } else {
    if (!failedCapabilitiesUntil.has(capability)) failedCapabilitiesUntil.set(capability, new Map());
    failedCapabilitiesUntil.get(capability).set(modelId, until);
    if (selectedByCapability.get(capability) === modelId) selectedByCapability.delete(capability);
  }
  console.warn(`[OpenRouter Models] Temporarily excluded ${modelId}${global || !capability ? " globally" : ` for ${capability}`} : ${reason}`);
}

/** True only when the provider error identifies a capability/parameter mismatch. */
export function isCapabilityCompatibilityError(error, capability) {
  if (Number(error?.status) !== 422) return false;
  const message = `${error?.providerMessage || ""} ${error?.message || ""}`.toLowerCase();
  if (capability === "json") return /(response[_ -]?format|json mode|structured output|json object|unsupported.*(parameter|format)|(parameter|format).*not supported)/i.test(message);
  if (capability === "image") return /(image|vision|image_url|multimodal).*(unsupported|not supported|not allowed|does not support)|((unsupported|not supported|not allowed).*(image|vision|image_url|multimodal))/i.test(message);
  if (capability === "text") return /(text input|text output|text modality).*(unsupported|not supported)|((unsupported|not supported).*(text input|text output|text modality))/i.test(message);
  return false;
}

export function getFreeModelSelectionStatus() {
  return {
    cacheAvailable: cachedModels.length > 0 && Date.now() < cacheExpiresAt,
    cacheExpiresAt: cacheExpiresAt || null,
    selectedTextModel: selectedByCapability.get("text") || null,
    selectedJsonModel: selectedByCapability.get("json") || null,
    selectedImageModel: selectedByCapability.get("image") || null,
    temporarilyExcludedModels: [...failedModelsUntil.keys()],
    temporarilyExcludedCapabilities: Object.fromEntries([...failedCapabilitiesUntil.entries()].map(([capability, entries]) => [capability, [...entries.keys()]]))
  };
}

export function clearOpenRouterModelCacheForTests() {
  cachedModels = [];
  cacheExpiresAt = 0;
  refreshPromise = null;
  failedModelsUntil.clear();
  failedCapabilitiesUntil.clear();
  selectedByCapability.clear();
}
