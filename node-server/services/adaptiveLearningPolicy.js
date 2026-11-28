import fs from "node:fs";
import { getConfigPath } from "./configPath.js";

const REQUIRED_LEARNER_CHOICES = Object.freeze([
  "show_activities",
  "show_videos",
  "start_ai_assessment",
  "choose_question_bank"
]);

const ALLOWED_RECOMMENDATION_IDS = new Set([
  ...REQUIRED_LEARNER_CHOICES,
  "repeat_explanation"
]);

const DEFAULT_POLICY = Object.freeze({
  version: 1,
  performanceThreshold: 60,
  recommendations: {
    beforeAssessment: [
      { id: "show_activities", label: "Explore catalogue activities" },
      { id: "show_videos", label: "Watch learning videos" },
      { id: "start_ai_assessment", label: "Check your understanding" },
      { id: "choose_question_bank", label: "Practise with the Question Bank" }
    ],
    belowThreshold: [
      { id: "repeat_explanation", label: "Review the explanation" },
      { id: "show_activities", label: "Try a catalogue activity" },
      { id: "show_videos", label: "Watch a learning video" },
      { id: "choose_question_bank", label: "Practise these ideas" },
      { id: "start_ai_assessment", label: "Try the assessment again" }
    ],
    atOrAboveThreshold: [
      { id: "show_videos", label: "Explore another explanation" },
      { id: "show_activities", label: "Explore catalogue activities" },
      { id: "start_ai_assessment", label: "Try another AI assessment" },
      { id: "choose_question_bank", label: "Practise with the Question Bank" },
      { id: "repeat_explanation", label: "Review the explanation" }
    ]
  }
});

let cachedSignature = null;
let cachedPolicy = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateRecommendationList(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`recommendations.${name} must be an array.`);
  }

  const seen = new Set();
  const items = value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`recommendations.${name}[${index}] must be an object.`);
    }

    const id = String(item.id || "").trim();
    const label = String(item.label || "").trim();
    if (!ALLOWED_RECOMMENDATION_IDS.has(id)) {
      throw new Error(`Unsupported recommendation id '${id}' in ${name}.`);
    }
    if (!label) {
      throw new Error(`Recommendation '${id}' in ${name} requires a label.`);
    }
    if (seen.has(id)) {
      throw new Error(`Duplicate recommendation id '${id}' in ${name}.`);
    }
    seen.add(id);
    return { id, label };
  });

  const missingChoices = REQUIRED_LEARNER_CHOICES.filter(id => !seen.has(id));
  if (missingChoices.length) {
    throw new Error(
      `recommendations.${name} must retain all four learner choices; missing: ${missingChoices.join(", ")}.`
    );
  }

  return items;
}

/** Validate SME policy data without allowing it to remove learner choices. */
export function normalizeAdaptiveLearningPolicy(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Adaptive learning policy must be a JSON object.");
  }
  if (value.version !== 1) {
    throw new Error("Adaptive learning policy version must be 1.");
  }

  const threshold = Number(value.performanceThreshold);
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
    throw new Error("performanceThreshold must be a number between 0 and 100.");
  }

  const recommendations = value.recommendations;
  if (!recommendations || typeof recommendations !== "object" || Array.isArray(recommendations)) {
    throw new Error("Adaptive learning policy requires a recommendations object.");
  }

  return {
    version: 1,
    performanceThreshold: threshold,
    recommendations: {
      beforeAssessment: validateRecommendationList(recommendations.beforeAssessment, "beforeAssessment"),
      belowThreshold: validateRecommendationList(recommendations.belowThreshold, "belowThreshold"),
      atOrAboveThreshold: validateRecommendationList(recommendations.atOrAboveThreshold, "atOrAboveThreshold")
    }
  };
}

/**
 * Read the SME-managed policy from the configured learning config directory.
 * Missing or invalid configuration safely preserves the existing 60% behaviour.
 * The file is reloaded automatically when its modification time or size changes.
 */
export function getAdaptiveLearningPolicy() {
  let policyPath;
  try {
    policyPath = getConfigPath("adaptive-learning-policy.json");
    if (!fs.existsSync(policyPath)) return clone(DEFAULT_POLICY);

    const stat = fs.statSync(policyPath);
    const signature = `${policyPath}:${stat.mtimeMs}:${stat.size}`;
    if (cachedPolicy && cachedSignature === signature) return clone(cachedPolicy);

    const parsed = JSON.parse(fs.readFileSync(policyPath, "utf8"));
    cachedPolicy = normalizeAdaptiveLearningPolicy(parsed);
    cachedSignature = signature;
    return clone(cachedPolicy);
  } catch (error) {
    console.warn(`[Adaptive Learning Policy] Using built-in defaults: ${error.message}`);
    cachedPolicy = null;
    cachedSignature = null;
    return clone(DEFAULT_POLICY);
  }
}

/** Pure recommendation selector, exported to make policy behaviour testable. */
export function buildAdaptiveRecommendations(session, policy = DEFAULT_POLICY) {
  const afterAssessment = session?.latestResult != null;
  const percentage = Number(session?.latestResult?.percentage);
  const list = !afterAssessment
    ? policy.recommendations.beforeAssessment
    : percentage < policy.performanceThreshold
      ? policy.recommendations.belowThreshold
      : policy.recommendations.atOrAboveThreshold;

  const items = list.map(item => ({ ...item }));
  if (!session?.content?.explanation) {
    items.unshift({ id: "repeat_explanation", label: "Try the AI explanation again" });
  }
  return items;
}
