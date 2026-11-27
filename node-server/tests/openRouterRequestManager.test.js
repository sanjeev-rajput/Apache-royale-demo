import test from "node:test";
import assert from "node:assert/strict";
import {
  requestOpenRouterChatCompletion,
  getOpenRouterRequestStatus,
  resetOpenRouterRequestStateForTests
} from "../services/openRouterRequestManager.js";

const okResponse = (content = "Hello") => ({
  ok: true,
  status: 200,
  headers: new Headers(),
  text: async () => JSON.stringify({
    model: "mock/free",
    choices: [{ finish_reason: "stop", message: { content } }],
    usage: { total_tokens: 4 }
  })
});

function setup(budget = "2") {
  process.env.APP_ENV = "LIVE";
  resetOpenRouterRequestStateForTests();
  process.env.OPENROUTER_DAILY_REQUEST_BUDGET = budget;
}

const request = (fetchImpl, extra = {}) => requestOpenRouterChatCompletion({
  apiKey: "test-key",
  body: { model: "mock/free", messages: [{ role: "user", content: "test" }] },
  fetchImpl,
  ...extra
});

test("counts a successful OpenRouter chat-completion request", async () => {
  setup("2");
  const result = await request(async () => okResponse());
  assert.equal(result.content, "Hello");
  assert.equal(getOpenRouterRequestStatus().requestsToday, 1);
  assert.equal(getOpenRouterRequestStatus().remaining, 1);
});

test("counts failed attempts and blocks requests after the application budget", async () => {
  setup("1");
  let networkCalls = 0;
  await assert.rejects(
    request(async () => {
      networkCalls += 1;
      return { ok: false, status: 503, headers: new Headers(), text: async () => JSON.stringify({ error: { message: "upstream unavailable" } }) };
    }),
    error => error.status === 503
  );
  await assert.rejects(
    request(async () => { networkCalls += 1; return okResponse(); }),
    error => error.code === "OPENROUTER_APP_BUDGET_EXHAUSTED"
  );
  assert.equal(networkCalls, 1, "the blocked request must not reach the network");
  assert.equal(getOpenRouterRequestStatus().requestsToday, 1);
});

test("opens the circuit on invalid credentials and does not make another request", async () => {
  setup("5");
  let calls = 0;
  const unauthorized = async () => {
    calls += 1;
    return { ok: false, status: 401, headers: new Headers(), text: async () => JSON.stringify({ error: { message: "Invalid API key" } }) };
  };
  await assert.rejects(request(unauthorized), error => error.failureType === "authentication");
  await assert.rejects(request(unauthorized), error => error.code === "OPENROUTER_CIRCUIT_OPEN");
  assert.equal(calls, 1);
});

test("opens the daily-limit circuit and prevents model-switch calls", async () => {
  setup("5");
  let calls = 0;
  const limited = async () => {
    calls += 1;
    return {
      ok: false,
      status: 429,
      headers: new Headers(),
      text: async () => JSON.stringify({ error: { message: "Free model requests per day exceeded", metadata: { limit_source: "openrouter_free_tier" } } })
    };
  };
  await assert.rejects(request(limited), error => error.failureType === "account_rate_limit");
  await assert.rejects(request(limited), error => error.code === "OPENROUTER_CIRCUIT_OPEN");
  assert.equal(calls, 1);
});

test("does not accept an empty or malformed provider envelope", async () => {
  setup("3");
  await assert.rejects(
    request(async () => ({ ok: true, status: 200, headers: new Headers(), text: async () => "not-json" })),
    error => error.code === "OPENROUTER_INVALID_ENVELOPE"
  );
  assert.equal(getOpenRouterRequestStatus().requestsToday, 1);
});

test("missing API key fails locally without consuming the request budget", async () => {
  setup("3");
  await assert.rejects(
    request(async () => okResponse(), { apiKey: "" }),
    error => error.code === "OPENROUTER_NOT_CONFIGURED"
  );
  assert.equal(getOpenRouterRequestStatus().requestsToday, 0);
});


test("refuses OpenRouter network calls in LOCAL mode", async () => {
  setup("3");
  process.env.APP_ENV = "LOCAL";
  let calls = 0;
  await assert.rejects(
    request(async () => { calls += 1; return okResponse(); }),
    error => error.code === "OPENROUTER_WRONG_ENVIRONMENT"
  );
  assert.equal(calls, 0);
  assert.equal(getOpenRouterRequestStatus().requestsToday, 0);
});

test("opens a short cooldown after repeated network failures", async () => {
  setup("5");
  let calls = 0;
  const networkFailure = async () => {
    calls += 1;
    throw new TypeError("simulated network failure");
  };
  for (let i = 0; i < 3; i += 1) {
    await assert.rejects(request(networkFailure), error => error.code === "OPENROUTER_NETWORK_ERROR");
  }
  await assert.rejects(request(networkFailure), error => error.code === "OPENROUTER_CIRCUIT_OPEN");
  assert.equal(calls, 3);
});

test("marks model-specific HTTP 404 as eligible for a controlled alternative model", async () => {
  setup("5");
  await assert.rejects(
    request(async () => ({ ok: false, status: 404, headers: new Headers(), text: async () => JSON.stringify({ error: { message: "Model not found" } }) })),
    error => error.failureType === "model_request_rejected" && error.retryable === true
  );
});
