import { generateStructuredResponse } from "../../services/llmProvider.js";

const OPTION_IDS = new Set(["A", "B", "C", "D"]);
const MIN_CONFIDENCE = 0.75;

/**
 * Independently solve the assessment without supplying the generator's answer key.
 * This is a second-model-call quality signal, not a mathematical proof of correctness.
 */
export async function verifyAdaptiveAssessment(assessment, context) {
  const questions = assessment.questions.map(({ id, prompt, options }) => ({
    id,
    prompt,
    options: options.map(({ id: optionId, text }) => ({ id: optionId, text }))
  }));

  const verification = await generateStructuredResponse({
    systemPrompt: `You are an independent K-12 assessment reviewer. Solve each question yourself using the question and options only. Do NOT assume any option is correct because of its position or wording. Do not receive or infer a proposed answer key. If a question is ambiguous, underspecified, has multiple defensible answers, or cannot be solved confidently, mark it uncertain. Return JSON only in this shape: {"answers":[{"questionId":"q1","answer":"A","confidence":0.95,"certain":true,"reason":"brief internal rationale"}]}. Use A/B/C/D for answer. Confidence must be a number from 0 to 1. Do not rewrite questions. Output language: ${context.language || "English"}.`,
    userPayload: {
      topic: context.topic,
      grade: context.grade,
      subject: context.subject,
      questions
    },
    temperature: 0,
    maxTokens: 1200,
    timeoutMs: Number(process.env.ADAPTIVE_ASSESSMENT_VERIFY_TIMEOUT_MS || 90000)
  });

  if (!verification || !Array.isArray(verification.answers) || verification.answers.length !== assessment.questions.length) {
    throw new Error("Independent verification returned an incomplete answer set.");
  }

  const byId = new Map();
  for (const item of verification.answers) {
    const id = String(item?.questionId || "").trim();
    const answer = String(item?.answer || "").trim().toUpperCase();
    const confidence = Number(item?.confidence);
    if (!id || byId.has(id) || !OPTION_IDS.has(answer) || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new Error("Independent verification returned malformed question evidence.");
    }
    byId.set(id, { answer, confidence, certain: item.certain === true });
  }

  const failures = [];
  for (const question of assessment.questions) {
    const evidence = byId.get(question.id);
    if (!evidence) {
      failures.push(`${question.id}: no independent answer`);
    } else if (!evidence.certain || evidence.confidence < MIN_CONFIDENCE) {
      failures.push(`${question.id}: uncertain independent answer`);
    } else if (evidence.answer !== question.correctOptionId) {
      failures.push(`${question.id}: proposed answer key disagrees with independent solution`);
    }
  }

  return {
    accepted: failures.length === 0,
    verifiedCount: assessment.questions.length - failures.length,
    questionCount: assessment.questions.length,
    failures
  };
}
