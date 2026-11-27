import test from "node:test";
import assert from "node:assert/strict";

const originalEnv = {
  APP_ENV: process.env.APP_ENV,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_DAILY_REQUEST_BUDGET: process.env.OPENROUTER_DAILY_REQUEST_BUDGET
};

test("LIVE provider uses centrally discovered free model and ignores caller model override", async () => {
  process.env.APP_ENV = "LIVE";
  process.env.OPENROUTER_API_KEY = "test-key";
  process.env.OPENROUTER_DAILY_REQUEST_BUDGET = "5";
  const manager = await import(`../services/openRouterModelManager.js?test=${Date.now()}`);
  manager.clearOpenRouterModelCacheForTests();
  const model = {
    id: "verified-free-model",
    name: "Verified Free Model",
    context_length: 16000,
    architecture: { input_modalities: ["text"], output_modalities: ["text"] },
    supported_parameters: [],
    pricing: { prompt: "0", completion: "0", request: "0" }
  };
  const originalFetch = globalThis.fetch;
  let postedBody;
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes("/models?")) return { ok: true, json: async () => ({ data: [model] }) };
    postedBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ choices: [{ message: { content: "ok" }, finish_reason: "stop" }] })
    };
  };
  try {
    const provider = await import(`../services/llmProvider.js?test=${Date.now()}`);
    const result = await provider.generateText({
      messages: [{ role: "user", content: "hello" }],
      model: "some-paid-or-stale-model"
    });
    assert.equal(result, "ok");
    assert.equal(postedBody.model, "verified-free-model");
  } finally {
    globalThis.fetch = originalFetch;
    manager.clearOpenRouterModelCacheForTests();
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
