function parseJson(text) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(cleaned);
}

/**
 * Creates a provider adapter for Ollama's /api/chat endpoint.
 *
 * Ollama-specific options stay inside this adapter. The misconception service
 * only depends on the generateStructuredResponse function contract.
 */
export function createOllamaJsonGenerator({
  model = "qwen2.5:3b-instruct",
  url = "http://localhost:11434/api/chat",
  temperature = 0,
  maxTokens = 450,
  timeoutMs = 60000,
  think = false
} = {}) {
  return async function generateStructuredResponse({
    systemPrompt,
    userPayload
  }) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        think,
        format: "json",
        options: {
          temperature,
          num_predict: maxTokens
        },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userPayload) }
        ]
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `Ollama request failed: ${response.status}${errorBody ? ` - ${errorBody}` : ""}`
      );
    }

    const data = await response.json();
    const content = data.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      const hasThinking = typeof data.message?.thinking === "string" &&
        data.message.thinking.trim().length > 0;

      throw new Error(
        hasThinking
          ? "Ollama returned no message content; a thinking response was present."
          : "Ollama returned an empty response"
      );
    }

    try {
      return parseJson(content);
    } catch {
      throw new Error(
        `Ollama returned invalid JSON. Response content: ${content.slice(0, 500)}`
      );
    }
  };
}
