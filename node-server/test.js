import {
  isAiFeatureEnabled,
  getAiFeatureConfig
} from "./services/learningLanguageConfig.js";

console.log("Misconception:",
  isAiFeatureEnabled("misconceptionDetection"));

console.log("Misconception quiz:",
  isAiFeatureEnabled("misconceptionDetection", "quizMode"));

console.log("Deep Dive:",
  isAiFeatureEnabled("deepDive"));

console.log("Feature config:",
  getAiFeatureConfig("misconceptionDetection"));