import test from "node:test";
import assert from "node:assert/strict";

process.env.APP_ENV = "LOCAL";
process.env.LEARNING_CONFIG_DIR = "../src/config";

const {
  normalizeAdaptiveAssessmentResult,
  selectUnseenQuestionBankQuestions
} = await import("../services/adaptiveLearningService.js");
const { isAdaptiveIntelligenceEnabled } = await import("../services/adaptiveIntelligenceConfig.js");
const {
  buildAdaptiveRecommendations,
  getAdaptiveLearningPolicy,
  normalizeAdaptiveLearningPolicy
} = await import("../services/adaptiveLearningPolicy.js");
const { getLearningProfileGuidance } = await import("../services/learningResourceService.js");

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
      },
      {
        questionId: "q2",
        selectedOptionId: null,
        correctOptionId: "A",
        isCorrect: false,
        explanation: "The learner did not submit an answer."
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
  assert.equal(result.questions[0].answered, true);
  assert.equal(result.questions[1].answered, false);
  assert.equal(result.questions[1].isCorrect, false);
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


test("Adaptive Intelligence is disabled by default and only exact true enables it", () => {
  assert.equal(isAdaptiveIntelligenceEnabled({}), false);
  assert.equal(isAdaptiveIntelligenceEnabled({ ADAPTIVE_INTELLIGENCE_ENABLED: "" }), false);
  assert.equal(isAdaptiveIntelligenceEnabled({ ADAPTIVE_INTELLIGENCE_ENABLED: "false" }), false);
  assert.equal(isAdaptiveIntelligenceEnabled({ ADAPTIVE_INTELLIGENCE_ENABLED: "yes" }), false);
  assert.equal(isAdaptiveIntelligenceEnabled({ ADAPTIVE_INTELLIGENCE_ENABLED: "TRUE" }), true);
});


test("Adaptive follow-up can load one referenced draft SME profile without status filtering", async () => {
  const guidance = await getLearningProfileGuidance("english_early_instruction");
  assert.match(guidance, /english_early_instruction/);
  assert.doesNotMatch(guidance, /english_early_practice/);
});


test("loads the SME-managed recommendation policy from the config directory", () => {
  const policy = getAdaptiveLearningPolicy();
  assert.equal(policy.version, 1);
  assert.equal(policy.performanceThreshold, 60);
  assert.deepEqual(
    policy.recommendations.beforeAssessment.map(item => item.id),
    ["show_activities", "show_videos", "start_ai_assessment", "choose_question_bank"]
  );
});

test("uses the configured threshold and ordering without removing learner choices", () => {
  const policy = getAdaptiveLearningPolicy();
  policy.performanceThreshold = 75;
  const below = buildAdaptiveRecommendations({
    latestResult: { percentage: 70 },
    content: { explanation: "Existing explanation" }
  }, policy);
  const atThreshold = buildAdaptiveRecommendations({
    latestResult: { percentage: 75 },
    content: { explanation: "Existing explanation" }
  }, policy);

  assert.equal(below[0].id, "repeat_explanation");
  assert.equal(atThreshold[0].id, "show_videos");
  for (const items of [below, atThreshold]) {
    const ids = items.map(item => item.id);
    for (const required of ["show_activities", "show_videos", "start_ai_assessment", "choose_question_bank"]) {
      assert.ok(ids.includes(required), `missing learner choice: ${required}`);
    }
  }
});

test("rejects a policy that attempts to remove one of the four learner choices", () => {
  const policy = getAdaptiveLearningPolicy();
  policy.recommendations.belowThreshold = policy.recommendations.belowThreshold
    .filter(item => item.id !== "choose_question_bank");
  assert.throws(() => normalizeAdaptiveLearningPolicy(policy), /retain all four learner choices/);
});
