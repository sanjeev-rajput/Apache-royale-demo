import { getLearningExplanationGuidance } from "../services/learningResourceService.js";

const MAX_HISTORY_MESSAGES = 8;

// The explanation service does not orchestrate catalogue or YouTube retrieval.
// It sends the learner's request to the configured LLM and returns its text.
const EXPLANATION_SYSTEM_PROMPT = `
You are Agentic Learning, a friendly, age-appropriate K-12 learning companion.

For a learner who asks to learn or understand a topic, teach the topic yourself
even when matching CSV catalogue activities exist. Start with a short, grade-
appropriate explanation, give simple examples, and then provide three practice
questions unless the learner requests a different number or format.

When the CSV catalogue does not fully satisfy the learner's request, create the
missing educational content yourself. This may include explanations, examples,
quizzes, exercises, questions or step-by-step guidance.

Use catalogue observations only for real activities actually returned by the
catalogue. Never invent activity names, links, grades, subjects or catalogue
content. Do not print raw activity URLs; the application renders catalogue
activities separately as clickable cards.

Keep the language and difficulty suitable for the learner's stated grade.
If the learner requests a specific number of questions, provide exactly that
number. Do not repeat explanations the learner explicitly asked you not to
repeat. Do not mention internal tools, planner steps or JSON.
`;

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(item => item && ["user", "assistant"].includes(item.role) &&
      typeof item.content === "string")
    .slice(-MAX_HISTORY_MESSAGES);
}

export async function runLearningAgent({ message, history = [], onLlmStatus } = {}) {
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("A valid learner message is required.");
  }

  const learnerMessage = message.trim();
  const recentHistory = cleanHistory(history).filter((item, index, list) =>
    !(index === list.length - 1 && item.role === "user" && item.content === learnerMessage)
  );
  const smeInstructions = await getLearningExplanationGuidance(learnerMessage);

  try {
    // Load the provider only when an explanation is requested. A missing or
    // misconfigured LLM must not prevent the Node server and resource routes
    // from starting.
    const { generateText, getLlmConfig } = await import("../services/llmProvider.js");
    const reply = await generateText({
      messages: [
        {
          role: "system",
          content: smeInstructions
            ? `${EXPLANATION_SYSTEM_PROMPT}\n\n${smeInstructions}`
            : EXPLANATION_SYSTEM_PROMPT
        },
        ...recentHistory,
        { role: "user", content: learnerMessage }
      ],
      temperature: 0.4,
      maxTokens: 900
    });
    onLlmStatus?.({
      state: "connected",
      message: "AI connection is ready.",
      model: getLlmConfig().model
    });

    return {
      reply,
      llmAvailable: true,
      showAiWarning: true
    };
  } catch (error) {
    // A provider/network/model-generation failure is confined to the explanation
    // response. The separate resource endpoint remains callable by Royale.
    console.warn("[Agent LLM] Explanation unavailable:", {
      operation: error.operation || "text_generation",
      attempts: error.attempts || 1,
      attemptedModels: error.attemptedModels || [],
      failureType: error.failureType || error.name || "provider_error",
      message: error.message
    });
    return {
      reply: "I’m unable to generate your learning explanation right now. Please try again shortly.",
      llmAvailable: false,
      showAiWarning: false,
      warning: {
        code: error.code || "LLM_GENERATION_FAILED",
        source: error.source || "external_llm_provider",
        accountLimit: error.accountLimit === true
      }
    };
  }
}
