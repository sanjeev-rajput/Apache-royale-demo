import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../../src/config/learning-language.json");

let cachedConfig = null;
let cachedMtime = 0;

export function getLearningLanguageConfig() {
  const stats = fs.statSync(configPath);
  if (!cachedConfig || stats.mtimeMs !== cachedMtime) {
    const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`Invalid learning language configuration: ${configPath}`);
    }
    if (parsed.intentRules !== undefined && !Array.isArray(parsed.intentRules)) {
      throw new Error("learning-language.json: intentRules must be an array");
    }
    if (parsed.conversationMessages !== undefined &&
        (typeof parsed.conversationMessages !== "object" || Array.isArray(parsed.conversationMessages))) {
      throw new Error("learning-language.json: conversationMessages must be an object");
    }
    cachedConfig = parsed;
    cachedMtime = stats.mtimeMs;
  }
  return cachedConfig;
}

const fallbackMessages = {
  welcome: "Hello! What would you like to learn today?",
  askForTopic: "Tell me what you'd like to learn, or mention your class. For example: ‘I want to learn about fractions’ or ‘Class 4.’",
  askForGrade: "I found activities related to {topic}. Which class are you in?",
  activitiesFound: "Here are activities about {topic} for {grade}.",
  activitiesAcrossClasses: "Here are activities about {topic} across classes.",
  noActivitiesForGrade: "I couldn't find activities about {topic} for {grade}.",
  noRelatedActivities: "I couldn't find activities about {topic} for {grade}, and I don't have related activities to show. Would you like to try another topic?",
  askForDifferentClass: "Which class would you like to explore? For example, Class 3 or Class 5.",
  noMoreActivities: "That’s all the activities I found for this search.",
  noActivities: "I couldn't find an exact match for {topic}. Which class are you in? I can also try searching with a different topic name."
};

export function getConversationMessage(key, values = {}) {
  const config = getLearningLanguageConfig();
  let message = config.conversationMessages?.[key] || fallbackMessages[key] || key;
  return String(message).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name] ?? "") : match
  );
}

function normalizeForIntentMatch(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\\s-]/g, " ")
    .replace(/\\s+/g, " ")
    .trim();
}

/**
 * Match an incoming message against SME-managed intentRules.
 * Higher priority wins; ties prefer the longer phrase.
 */
export function matchConfiguredIntent(message) {
  const text = normalizeForIntentMatch(message);
  if (!text) return null;

  const rules = getLearningLanguageConfig().intentRules || [];
  const candidates = [];

  for (const rule of rules) {
    if (!rule || typeof rule.intent !== "string" || !Array.isArray(rule.phrases)) {
      continue;
    }

    for (const phrase of rule.phrases) {
      const normalizedPhrase = normalizeForIntentMatch(phrase);
      if (normalizedPhrase && text.includes(normalizedPhrase)) {
        candidates.push({
          ...rule,
          priority: Number.isFinite(Number(rule.priority)) ? Number(rule.priority) : 0,
          matchedPhrase: phrase,
          matchedPhraseLength: normalizedPhrase.length
        });
      }
    }
  }

  candidates.sort((a, b) =>
    b.priority - a.priority ||
    b.matchedPhraseLength - a.matchedPhraseLength
  );

  return candidates[0] || null;
}

