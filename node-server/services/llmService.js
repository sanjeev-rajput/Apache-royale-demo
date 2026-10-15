// services/llmService.js

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODEL =
  process.env.OPENROUTER_MODEL ||
  "mistralai/mistral-medium-3";

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured"
    );
  }

  return key;
}

export async function generateTutorResponse({
  message,
  conversation
}) {
  const apiKey = getApiKey();

  const systemPrompt = `
You are a friendly K-12 learning assistant.

Your job is to help a student understand what they want
to learn and guide them toward the learning activities
available in the supplied catalog.

IMPORTANT RULES:

1. The learning catalog is the source of truth.
2. Never invent a learning activity, URL, module or resource.
3. Do not invent catalog results.
4. If catalog results are supplied, base recommendations
   only on those results.
5. Keep explanations appropriate for the student's class.
6. Be concise and conversational.
7. If the student has not supplied a class, ask for it
   when that is useful.
8. If there are no matching resources, say so honestly.
9. Never expose internal implementation details.
10. Do not mention "LLM", "OpenRouter", prompts or APIs
    to the student.

The backend has already interpreted the student's request.
You should improve the conversational response, not replace
the backend's catalog search.
`;

  const userPrompt = JSON.stringify({
    studentMessage: message,
    conversation: {
      topic: conversation.topic || "",
      grade: conversation.grade || "",
      intent: conversation.intent || "",
      waitingForGrade:
        conversation.waitingForGrade || false
    },
    catalogResults: conversation.results || [],
    catalogResultCount: conversation.total || 0,
    backendReply: conversation.reply || ""
  });

  const response = await fetch(
    OPENROUTER_URL,
    {
      method: "POST",

      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",

        "HTTP-Referer":
          process.env.OPENROUTER_SITE_URL ||
          "http://localhost",

        "X-Title":
          process.env.OPENROUTER_APP_NAME ||
          "K12 Learning Chatbot"
      },

      body: JSON.stringify({
        model: MODEL,

        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],

        temperature: 0.3,

        max_tokens: 500
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const reply =
    data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error(
      "OpenRouter returned an empty response"
    );
  }

  return reply;
}

export function isLLMConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}