import { generateAssessment } from "./adaptiveAssessmentGenerator.js";
import { validateAssessmentPayload, toLearnerAssessment } from "./adaptiveAssessmentValidator.js";
import { verifyAdaptiveAssessment } from "./adaptiveAssessmentVerifier.js";
import { adaptiveAssessmentAttemptManager } from "./adaptiveAssessmentAttemptManager.js";
import { evaluateAnswers } from "./adaptiveAssessmentEvaluator.js";
import { isAdaptiveAssessmentVerificationEnabled } from "./adaptiveAssessmentVerificationConfig.js";

function normalizeContext(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Assessment context must be an object.");
  const context = {
    topic: String(input.topic || "").trim(),
    grade: String(input.grade || "Not specified").trim(),
    subject: String(input.subject || "Not specified").trim(),
    language: String(input.language || "English").trim(),
    instructionProfileId: String(input.instructionProfileId || "").trim(),
    learningContext: String(input.learningContext || "").trim()
  };
  if (!context.topic || context.topic.length > 160) throw new Error("A topic between 1 and 160 characters is required.");
  if (context.grade.length > 60 || context.subject.length > 80 || context.language.length > 60) throw new Error("Assessment context contains an oversized field.");
  if (context.learningContext.length > 3000) throw new Error("Learning context must not exceed 3000 characters.");
  return context;
}

function verifyInBackground(assessment, context) {
  // Verification is a diagnostic quality signal only. It must never delay or
  // prevent delivery of a structurally valid assessment to the learner.
  void verifyAdaptiveAssessment(assessment, context)
    .then(result => {
      if (result.accepted) {
        console.info(`[Adaptive Assessment Verification] Passed ${result.verifiedCount}/${result.questionCount} questions.`);
      } else {
        console.warn("[Adaptive Assessment Verification] Review flagged generated content:", result.failures);
      }
    })
    .catch(error => {
      console.warn("[Adaptive Assessment Verification] Background check unavailable:", error.message);
    });
}

export async function createAdaptiveAssessment(inputContext) {
  const context = normalizeContext(inputContext);
  let retryHint = "";
  let lastFailure = null;

  // Keep one bounded retry for malformed generated structure. This is
  // independent of the optional second-model verification setting.
  for (let attemptNumber = 1; attemptNumber <= 2; attemptNumber++) {
    let assessment;
    try {
      assessment = validateAssessmentPayload(await generateAssessment({ ...context, assessmentRetryHint: retryHint }));
    } catch (error) {
      lastFailure = error;
      console.warn(`[Adaptive Assessment] Generation/structure attempt ${attemptNumber} failed:`, error.message);
      retryHint = `Correct the structural validation error: ${error.message}. Return all five complete questions and four non-empty options per question.`;
      continue;
    }

    const attempt = adaptiveAssessmentAttemptManager.create({ assessment, context });
    if (isAdaptiveAssessmentVerificationEnabled()) {
      verifyInBackground(assessment, context);
    }
    return {
      attemptId: attempt.attemptId,
      expiresAt: attempt.expiresAt,
      assessment: toLearnerAssessment(assessment)
    };
  }

  const error = new Error("AI assessment questions could not be generated in the required question format. Please try again or use the Question Bank.");
  error.statusCode = 502;
  error.code = "ADAPTIVE_ASSESSMENT_GENERATION_FAILED";
  error.cause = lastFailure || undefined;
  throw error;
}

export function submitAdaptiveAssessment({ attemptId, answers }) {
  const id = String(attemptId || "").trim();
  if (!id || id.length > 80) {
    const error = new Error("A valid attemptId is required.");
    error.statusCode = 400;
    throw error;
  }
  const attempt = adaptiveAssessmentAttemptManager.get(id);
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
  adaptiveAssessmentAttemptManager.markSubmitted(id, result);
  return { attemptId: id, ...result };
}
