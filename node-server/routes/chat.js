
import express from "express";
import dotenv from "dotenv";

import { handleLearningChat, getLearningConversationContext } from "../services/conversationInterpreter.js";
import { handlePracticeMessage } from "../services/interactiveLearning.js";
import { getLearningCatalog } from "../services/learningCatalog.js";
import { matchConfiguredIntent } from "../services/learningLanguageConfig.js";

dotenv.config();

const router = express.Router();

// Local Ollama model used for learning-intent recognition.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b-instruct";
const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
const OLLAMA_ENABLED = process.env.OLLAMA_ENABLED !== "false";

// Short-lived conversation history for AI explanations.
const aiConversations = new Map();
const MAX_HISTORY_MESSAGES = 10;

// Identify messages that ask for an explanation or educational answer.
function isEducationalQuestion(message) {
  return /\b(explain|what is|what are|why|how|give me an example|examples|example|define|definition|meaning|describe|difference between|tell me about|teach me about)\b/i.test(
    message
  );
}

async function generateExplanation({
  conversationId,
  message,
  topic,
  subtopic,
  grade
}) {
  const id = String(conversationId);
  const history = aiConversations.get(id) || [];

  const context = [
    topic && `Topic: ${topic}`,
    subtopic && `Subtopic: ${subtopic}`,
    grade && `Class: ${grade}`
  ]
    .filter(Boolean)
    .join("\n");

  
const systemPrompt = `
You are a friendly, patient, and accurate K-12 learning tutor.

TEACHING RULES:
1. Explain concepts using simple, age-appropriate language.
2. Adapt explanations to the student's class level.
3. Use clear, familiar examples and short sentences.
4. Keep explanations focused on the student's question.
5. When explaining grammar, distinguish nouns, pronouns,
   verbs, adjectives, and other parts of speech correctly.
6. Do not introduce advanced concepts unless requested.
7. If the class or topic is unclear, ask a short question.
8. Never invent catalog activities or resource URLs.
9. Use conversation history to understand follow-up questions.
10. Encourage the student to ask questions and practice.

RESPONSE STYLE:
- Use Markdown headings, bold text, and bullet lists when useful.
- Prefer short explanations for younger students.
- When appropriate, finish with one simple practice question.

CURRENT LEARNING CONTEXT:
${context || "No specific topic or class is selected."}
`.trim();

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message }
  ];

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      options: { temperature: 0.4, num_predict: 500 },
      messages
    }),
    signal: AbortSignal.timeout(60000)
  });

  if (!response.ok) {
    throw new Error(`Ollama explanation request failed: ${response.status}`);
  }

  const data = await response.json();
  const reply = data.message?.content;

  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("Ollama returned an empty explanation");
  }

  const updatedHistory = [
    ...history,
    { role: "user", content: message },
    { role: "assistant", content: reply.trim() }
  ].slice(-MAX_HISTORY_MESSAGES);

  aiConversations.set(id, updatedHistory);

  return reply.trim();
}


// Ask the local Ollama model to interpret the student's wording, not to invent catalog results.
async function recognizeLearningIntent(message) {
  const catalog = getLearningCatalog();
  const topics = [...new Set(catalog.map(item => item.topic).filter(Boolean))];
  const subtopics = [...new Set(catalog.map(item => item.subtopic).filter(Boolean))];

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      options: { temperature: 0 },
      messages: [
        {
          role: "system",
          content: `Interpret a student's learning request. Return a JSON object with keys intent, topic, subtopic, grade. Use intent="learn" for a request to learn/find activities, otherwise intent="other". Choose topic/subtopic only from these catalog values; if none fits, use empty strings. Grade must be Nursery or Class 1 through Class 12, or empty. Do not invent catalog entries.\nCatalog topics: ${JSON.stringify(topics)}\nCatalog subtopics: ${JSON.stringify(subtopics)}\nExample: {"intent":"learn","topic":"Grammar","subtopic":"Nouns","grade":"Class 1"}`
        },
        { role: "user", content: message }
      ]
    }),
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw new Error(`Ollama intent request failed: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.message?.content;
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Ollama returned an empty intent response");
  }

  const cleaned = raw.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned);

  return {
    intent: parsed.intent === "learn" ? "learn" : "other",
    topic: typeof parsed.topic === "string" ? parsed.topic.trim() : "",
    subtopic: typeof parsed.subtopic === "string" ? parsed.subtopic.trim() : "",
    grade: typeof parsed.grade === "string" ? parsed.grade.trim() : ""
  };
}

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const message = String(
      req.body?.message || req.body?.prompt || ""
    ).trim();

    const conversationId = req.body?.conversationId;

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    // Interactive practice is handled separately from catalog search and tutoring chat.
    if (OLLAMA_ENABLED) {
      try {
        const practiceResult = await handlePracticeMessage({
          conversationId,
          message,
          context: getLearningConversationContext(conversationId),
          model: OLLAMA_MODEL,
          url: OLLAMA_URL
        });
        if (practiceResult?.handled) {
          return res.json({
            conversationId,
            reply: practiceResult.reply,
            intent: practiceResult.intent,
            topic: "",
            subtopic: "",
            grade: "",
            waitingForGrade: false,
            results: [],
            llm: {
              enabled: true,
              intentProvider: null,
              intentModel: null,
              explanationProvider: "ollama",
              explanationModel: OLLAMA_MODEL,
              mode: "local_interactive_practice"
            }
          });
        }
      } catch (error) {
        console.error("Interactive practice failed:", error.message);
        return res.status(502).json({
          error: "Unable to generate or evaluate the practice question. Please try again."
        });
      }
    }

    // Prefer SME-configured intent rules. Use Ollama only when no configured
    // rule matches, so common intents can be maintained without code changes.
    let aiIntent = null;
    let configuredIntent = null;

    try {
      configuredIntent = matchConfiguredIntent(message);
    } catch (error) {
      console.error("Learning language configuration error:", error.message);
    }

    if (configuredIntent) {
      // Topic and grade are still resolved by the interpreter/catalog.
      // The configured rule supplies intent only; it never invents activities.
      aiIntent = {
        intent: configuredIntent.intent === "learn" ? "learn" : configuredIntent.intent,
        topic: "",
        subtopic: "",
        grade: ""
      };
    } else if (OLLAMA_ENABLED) {
      try {
        aiIntent = await recognizeLearningIntent(message);
      } catch (error) {
        console.error("Local AI intent recognition failed:", error.message);
      }
    }

    const result = handleLearningChat({
      conversationId,
      message,
      aiIntent
    });

    if (result.status !== 200) {
      return res.status(result.status).json(result.body);
    }

    const body = { ...result.body };

    // Use local Ollama for educational explanations, not for catalog routing.
    if (OLLAMA_ENABLED && isEducationalQuestion(message)) {
      try {
        const explanation = await generateExplanation({
          conversationId,
          message,
          topic: body.topic,
          subtopic: body.subtopic,
          grade: body.grade
        });

        body.reply = explanation;
      } catch (error) {
        console.error("AI explanation failed:", error.message);
        // Keep the interpreter's original reply as a fallback.
      }
    }

    return res.json({
      ...body,
      llm: {
        enabled: OLLAMA_ENABLED,
        intentProvider: OLLAMA_ENABLED ? "ollama" : null,
        intentModel: OLLAMA_ENABLED ? OLLAMA_MODEL : null,
        explanationProvider: OLLAMA_ENABLED && isEducationalQuestion(message)
          ? "ollama" : null,
        explanationModel: OLLAMA_ENABLED && isEducationalQuestion(message)
          ? OLLAMA_MODEL : null,
        mode: OLLAMA_ENABLED && isEducationalQuestion(message)
          ? "local_intent_and_explanation"
          : aiIntent?.intent === "learn"
            ? "local_intent_and_catalog"
            : OLLAMA_ENABLED ? "local_intent" : "not_used"
      }
    });
  } catch (error) {
    console.error("Chat route error:", error);

    return res.status(500).json({
      error: "Unable to process chat request"
    });
  }
});

export default router;