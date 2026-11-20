import { generateAssessment } from "./assessmentGenerator.js";
import { assessmentAttemptManager } from "./assessmentAttemptManager.js";
import { toLearnerAssessment } from "./assessmentValidator.js";
import { evaluateAnswers } from "./assessmentEvaluator.js";

function normalizeContext(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Assessment context must be an object.");
  }

  const topic = String(input.topic || "").trim();
  const grade = String(input.grade || "").trim();
  const subject = String(input.subject || "").trim();
  const language = String(input.language || "English").trim();
  const instructionProfileId = String(input.instructionProfileId || "").trim();
  const learningContext = String(input.learningContext || "").trim();

  if (!topic || topic.length > 160) {
    throw new Error("A topic between 1 and 160 characters is required.");
  }
  if (grade.length > 60 || subject.length > 80 || language.length > 60) {
    throw new Error("Assessment context contains an oversized field.");
  }
  if (learningContext.length > 3000) {
    throw new Error("Learning context must not exceed 3000 characters.");
  }

  return {
    topic,
    grade: grade || "Not specified",
    subject: subject || "Not specified",
    language: language || "English",
    instructionProfileId,
    learningContext
  };
}

export async function createAssessment(inputContext) {
  const context = normalizeContext(inputContext);
  const assessment = await generateAssessment(context);
  const attempt = assessmentAttemptManager.create({ assessment, context });

  return {
    attemptId: attempt.attemptId,
    expiresAt: attempt.expiresAt,
    assessment: toLearnerAssessment(assessment)
  };
}

export function submitAssessment({ attemptId, answers }) {
  const id = String(attemptId || "").trim();
  if (!id || id.length > 80) {
    const error = new Error("A valid attemptId is required.");
    error.statusCode = 400;
    throw error;
  }

  const attempt = assessmentAttemptManager.get(id);
  if (!attempt) {
    const error = new Error("This assessment attempt was not found or has expired. Please generate a new assessment.");
    error.statusCode = 404;
    error.code = "ASSESSMENT_ATTEMPT_NOT_FOUND";
    throw error;
  }

  if (attempt.submitted) {
    const error = new Error("This assessment attempt has already been submitted.");
    error.statusCode = 409;
    error.code = "ATTEMPT_ALREADY_SUBMITTED";
    throw error;
  }

  const result = evaluateAnswers(attempt.assessment, answers);
  assessmentAttemptManager.markSubmitted(id, result);

  return {
    attemptId: id,
    ...result
  };
}
