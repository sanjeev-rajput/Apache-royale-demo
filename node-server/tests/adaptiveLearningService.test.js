import test from "node:test";
import assert from "node:assert/strict";

process.env.APP_ENV = "LOCAL";
process.env.LEARNING_CONFIG_DIR = "../src/config";

const {
  normalizeAdaptiveAssessmentResult,
  selectUnseenQuestionBankQuestions
} = await import("../services/adaptiveLearningService.js");

test("normalizes AI assessment feedback without changing deterministic score fields", () => {
  const result = normalizeAdaptiveAssessmentResult("ai", "ai-attempt", {
    score: 1,
    total: 2,
    percentage: 50,
    questionResults: [
      {
        questionId: "q1",
        selectedOptionId: "B",
        correctOptionId: "B",
        isCorrect: true,
        explanation: "Correct because the numerator is one."
      }
    ]
  }, "fractions");

  assert.equal(result.source, "ai");
  assert.equal(result.score, 1);
  assert.equal(result.total, 2);
  assert.equal(result.percentage, 50);
  assert.equal(result.questions[0].earnedMarks, 1);
  assert.equal(result.questions[0].availableMarks, 1);
  assert.match(result.questions[0].feedback, /numerator/);
});

test("normalizes publisher marks and feedback from Question Bank results", () => {
  const result = normalizeAdaptiveAssessmentResult("question_bank", "qb-attempt", {
    score: 2,
    total: 3,
    percentage: 67,
    questionResults: [
      {
        questionId: "publisher-q1",
        selectedOptionId: "A",
        correctOptionId: "A",
        isCorrect: true,
        score: 2,
        totalMarks: 3,
        feedback: "Publisher feedback"
      }
    ]
  }, "fractions");

  assert.equal(result.score, 2);
  assert.equal(result.total, 3);
  assert.equal(result.questions[0].earnedMarks, 2);
  assert.equal(result.questions[0].availableMarks, 3);
  assert.equal(result.questions[0].feedback, "Publisher feedback");
});

test("selects only unseen Question Bank IDs for the adaptive session", () => {
  const questions = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(
    selectUnseenQuestionBankQuestions(questions, ["a", "b"], 5),
    [{ id: "c" }]
  );
  assert.deepEqual(
    selectUnseenQuestionBankQuestions(questions, ["a", "b", "c"], 5),
    []
  );
});
