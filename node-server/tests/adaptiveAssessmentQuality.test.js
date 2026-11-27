import test from "node:test";
import assert from "node:assert/strict";

import { validateAssessmentPayload, toLearnerAssessment } from "../adaptive/assessment/adaptiveAssessmentValidator.js";
import { decideAssessment, MAX_GENERATION_ATTEMPTS } from "../adaptive/assessment/adaptiveAssessmentDecision.js";
import { AssessmentAttemptManager } from "../adaptive/assessment/adaptiveAssessmentAttemptManager.js";
import { evaluateAnswers } from "../adaptive/assessment/adaptiveAssessmentEvaluator.js";
import { isAdaptiveAssessmentVerificationEnabled } from "../adaptive/assessment/adaptiveAssessmentVerificationConfig.js";

function validPayload() {
  return {
    title: "Fractions",
    instructions: "Choose one answer.",
    questions: Array.from({ length: 5 }, (_, index) => ({
      id: `q${index + 1}`,
      prompt: `What is ${index + 1} divided by 1?`,
      options: [
        { id: "A", text: String(index + 1) },
        { id: "B", text: "0" },
        { id: "C", text: "2" },
        { id: "D", text: "3" }
      ],
      correctOptionId: "A",
      explanation: "Dividing by one leaves the number unchanged."
    }))
  };
}

test("Adaptive validator rejects an empty option before learner delivery", () => {
  const payload = validPayload();
  payload.questions[2].options[3].text = "  ";
  assert.throws(() => validateAssessmentPayload(payload), /option D must be a non-empty string/i);
});

test("Adaptive learner payload never contains answer keys or explanations", () => {
  const assessment = validateAssessmentPayload(validPayload());
  const learnerView = toLearnerAssessment(assessment);
  assert.equal("correctOptionId" in learnerView.questions[0], false);
  assert.equal("explanation" in learnerView.questions[0], false);
  assert.equal(learnerView.questions.length, 5);
});

test("decision engine accepts verified content and bounds regeneration", () => {
  assert.deepEqual(decideAssessment({ accepted: true }, 1), { action: "accept" });
  assert.equal(decideAssessment({ accepted: false, failures: ["q1 mismatch"] }, 1).action, "regenerate");
  assert.equal(decideAssessment({ accepted: false, failures: ["q1 mismatch"] }, MAX_GENERATION_ATTEMPTS).action, "reject");
});

test("Adaptive attempts score deterministically and reject duplicate submissions", () => {
  const manager = new AssessmentAttemptManager();
  const assessment = validateAssessmentPayload(validPayload());
  const attempt = manager.create({ assessment, context: { topic: "fractions" } });
  const result = evaluateAnswers(assessment, assessment.questions.map(question => ({
    questionId: question.id,
    selectedOptionId: "A"
  })));
  assert.equal(result.score, 5);
  assert.equal(result.percentage, 100);
  manager.markSubmitted(attempt.attemptId, result);
  assert.throws(() => manager.markSubmitted(attempt.attemptId, result), /already been submitted/i);
});


test("independent assessment verification is opt-in and supports common env boolean values", () => {
  assert.equal(isAdaptiveAssessmentVerificationEnabled({}), false);
  assert.equal(isAdaptiveAssessmentVerificationEnabled({ ADAPTIVE_ASSESSMENT_VERIFY: "false" }), false);
  assert.equal(isAdaptiveAssessmentVerificationEnabled({ ADAPTIVE_ASSESSMENT_VERIFY: "true" }), true);
  assert.equal(isAdaptiveAssessmentVerificationEnabled({ ADAPTIVE_ASSESSMENT_VERIFY: "ON" }), true);
});
