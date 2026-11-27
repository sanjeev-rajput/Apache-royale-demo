import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const providerUrl = new URL("../services/llmProvider.js", import.meta.url).href;

function runImport(envOverrides = {}, removeAppEnv = false) {
  const env = { ...process.env, ...envOverrides };
  if (removeAppEnv) delete env.APP_ENV;
  const script = `const m = await import(${JSON.stringify(providerUrl)}); process.stdout.write(JSON.stringify(m.getLlmConfig()));`;
  return spawnSync(process.execPath, ["--input-type=module", "-e", script], { env, encoding: "utf8" });
}

test("missing APP_ENV does not crash provider module initialization", () => {
  const result = runImport({}, true);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout.trim().split("\n").at(-1)), { provider: "disabled", model: null });
});

test("LOCAL selects the configured Ollama model", () => {
  const result = runImport({ APP_ENV: "LOCAL", OLLAMA_MODEL: "local-test-model" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout.trim().split("\n").at(-1)), { provider: "ollama", model: "local-test-model" });
});

test("LIVE selects OpenRouter without requiring the key at startup", () => {
  const env = { ...process.env, APP_ENV: "LIVE" };
  delete env.OPENROUTER_API_KEY;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `const m = await import(${JSON.stringify(providerUrl)}); process.stdout.write(JSON.stringify(m.getLlmConfig()));`], { env, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout.trim().split("\n").at(-1)), { provider: "openrouter", model: "auto-free" });
});

test("LOCAL generateText uses Ollama and does not contact OpenRouter", () => {
  const env = { ...process.env, APP_ENV: "LOCAL", OLLAMA_MODEL: "mock-ollama-model" };
  const script = `
    let captured;
    globalThis.fetch = async (url, options) => {
      captured = { url, body: JSON.parse(options.body) };
      return { ok: true, text: async () => JSON.stringify({ model: "mock-ollama-model", message: { content: "local response" }, done_reason: "stop" }) };
    };
    const m = await import(${JSON.stringify(providerUrl)});
    const value = await m.generateText({ messages: [{ role: "user", content: "test" }] });
    process.stdout.write(JSON.stringify({ value, captured }));
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], { env, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout.trim().split("\n").at(-1));
  assert.equal(output.value, "local response");
  assert.equal(output.captured.url, "http://localhost:11434/api/chat");
  assert.equal(output.captured.body.model, "mock-ollama-model");
});
