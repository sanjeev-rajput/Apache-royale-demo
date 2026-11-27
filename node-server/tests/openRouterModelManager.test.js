import test from "node:test";
import assert from "node:assert/strict";
import {
  getAvailableFreeModels,
  getSelectedFreeModel,
  markFreeModelUnavailable,
  getFreeModelSelectionStatus,
  isCapabilityCompatibilityError,
  clearOpenRouterModelCacheForTests
} from "../services/openRouterModelManager.js";

const originalEnv = {
  APP_ENV: process.env.APP_ENV,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MAX_DISCOVERED_MODELS: process.env.OPENROUTER_MAX_DISCOVERED_MODELS
};

test.afterEach(() => {
  clearOpenRouterModelCacheForTests();
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function model(id, overrides = {}) {
  return {
    id,
    name: id,
    context_length: 16000,
    architecture: { input_modalities: ["text"], output_modalities: ["text"] },
    supported_parameters: ["response_format"],
    pricing: { prompt: "0", completion: "0", request: "0" },
    ...overrides
  };
}

function mockFetch(models) {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return { ok: true, json: async () => ({ data: models }) };
  };
  fetchImpl.calls = () => calls;
  return fetchImpl;
}

test("LOCAL mode refuses OpenRouter discovery", async () => {
  process.env.APP_ENV = "LOCAL";
  process.env.OPENROUTER_API_KEY = "test-key";
  await assert.rejects(getAvailableFreeModels({ fetchImpl: mockFetch([]) }), /only when APP_ENV=LIVE/);
});

test("selects only zero-priced text models with enough context", async () => {
  process.env.APP_ENV = "LIVE";
  process.env.OPENROUTER_API_KEY = "test-key";
  const fetchImpl = mockFetch([
    model("free-good"),
    model("paid", { pricing: { prompt: "0.01", completion: "0" } }),
    model("short-context", { context_length: 2048 }),
    model("image-only", { architecture: { input_modalities: ["image"], output_modalities: ["text"] } })
  ]);
  const found = await getAvailableFreeModels({ fetchImpl });
  assert.deepEqual(found.map(item => item.id), ["free-good"]);
  assert.equal(fetchImpl.calls(), 1);
});

test("structured requests require response_format support", async () => {
  process.env.APP_ENV = "LIVE";
  process.env.OPENROUTER_API_KEY = "test-key";
  const fetchImpl = mockFetch([
    model("plain-only", { supported_parameters: ["temperature"] }),
    model("json-capable")
  ]);
  const found = await getAvailableFreeModels({ requireJson: true, fetchImpl });
  assert.deepEqual(found.map(item => item.id), ["json-capable"]);
});

test("caches discovery and selects the next model after an incompatibility", async () => {
  process.env.APP_ENV = "LIVE";
  process.env.OPENROUTER_API_KEY = "test-key";
  const fetchImpl = mockFetch([model("first"), model("second")]);
  const first = await getSelectedFreeModel({ fetchImpl });
  assert.equal(first.id, "first");
  markFreeModelUnavailable("first", "test rejection");
  const next = await getSelectedFreeModel();
  assert.equal(next.id, "second");
  assert.equal(fetchImpl.calls(), 1);
  assert.equal(getFreeModelSelectionStatus().selectedTextModel, "second");
});

test("does not accept models with a non-zero request charge", async () => {
  process.env.APP_ENV = "LIVE";
  process.env.OPENROUTER_API_KEY = "test-key";
  const fetchImpl = mockFetch([model("request-fee", { pricing: { prompt: "0", completion: "0", request: "0.001" } })]);
  assert.deepEqual(await getAvailableFreeModels({ fetchImpl }), []);
});

test("image requests require an eligible free model with image input", async () => {
  process.env.APP_ENV = "LIVE";
  process.env.OPENROUTER_API_KEY = "test-key";
  const fetchImpl = mockFetch([
    model("text-only"),
    model("free-vision", { architecture: { input_modalities: ["text", "image"], output_modalities: ["text"] } })
  ]);
  const found = await getAvailableFreeModels({ requireImage: true, fetchImpl });
  assert.deepEqual(found.map(item => item.id), ["free-vision"]);
});


test("422 JSON capability incompatibility excludes model only from JSON selection", async () => {
  process.env.APP_ENV = "LIVE";
  process.env.OPENROUTER_API_KEY = "test-key";
  const fetchImpl = mockFetch([model("first"), model("second")]);
  assert.equal((await getSelectedFreeModel({ requireJson: true, fetchImpl })).id, "first");
  const error = { status: 422, providerMessage: "response_format is not supported by this model" };
  assert.equal(isCapabilityCompatibilityError(error, "json"), true);
  markFreeModelUnavailable("first", "HTTP 422 JSON capability mismatch", { capability: "json" });
  assert.equal((await getSelectedFreeModel({ requireJson: true })).id, "second");
  assert.equal((await getSelectedFreeModel({ requireJson: false })).id, "first");
});

test("generic 422 does not exclude a model", () => {
  assert.equal(isCapabilityCompatibilityError({ status: 422, providerMessage: "Invalid request body" }, "json"), false);
  assert.equal(isCapabilityCompatibilityError({ status: 422, providerMessage: "Invalid request body" }, "image"), false);
});

test("404 exclusion is global across capabilities", async () => {
  process.env.APP_ENV = "LIVE";
  process.env.OPENROUTER_API_KEY = "test-key";
  const fetchImpl = mockFetch([model("first"), model("second")]);
  assert.equal((await getSelectedFreeModel({ requireJson: true, fetchImpl })).id, "first");
  markFreeModelUnavailable("first", "HTTP 404", { global: true });
  assert.equal((await getSelectedFreeModel({ requireJson: false })).id, "second");
  assert.equal((await getSelectedFreeModel({ requireImage: false, requireJson: true })).id, "second");
});
