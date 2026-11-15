const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "for", "from",
  "give", "help", "i", "in", "is", "it", "me", "of", "on", "or", "please",
  "show", "some", "teach", "the", "to", "want", "what", "with", "you",
  "find", "search", "activity", "activities", "content", "learn", "learning",
  "about", "related", "resource", "resources", "lesson", "lessons", "class",
  "grade", "standard", "std", "my", "this", "that", "these", "those"
]);

const SUBJECT_ALIASES = new Map([
  ["math", "mathematics"], ["maths", "mathematics"], ["mathematics", "mathematics"],
  ["science", "science"], ["english", "english"], ["hindi", "hindi"],
  ["evs", "evs"], ["environmental", "evs"], ["social", "social"],
  ["sst", "social"], ["computer", "computer"], ["computers", "computer"]
]);

export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(token => {
      if (token.length > 4 && token.endsWith("ies")) return `${token.slice(0, -3)}y`;
      if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
      return token;
    })
    .join(" ");
}

function getMessageTokens(message) {
  const normalized = normalizeSearchText(message);
  return [...new Set(normalized.split(" ").filter(token =>
    token && !STOP_WORDS.has(token) && !/^\d+$/.test(token)))];
}

function getRequestedGrade(message) {
  const text = String(message ?? "").toLowerCase();
  const match = text.match(/\b(?:class|grade|standard|std)\s*(?:[-:]\s*)?(\d{1,2})\b/) ||
    text.match(/\b(\d{1,2})(?:st|nd|rd|th)\s+grade\b/);
  return match ? Number(match[1]) : null;
}

function getGradeNumber(value) {
  const text = String(value ?? "").toLowerCase();
  const match = text.match(/\b(?:class|grade|standard|std)\s*(?:[-:]\s*)?(\d{1,2})\b/) ||
    text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  return match ? Number(match[1]) : null;
}

function getRequestedSubjects(tokens) {
  return new Set(tokens.map(token => SUBJECT_ALIASES.get(token)).filter(Boolean));
}

function getFieldText(result, fields) {
  return fields.map(field => result?.[field]).filter(value =>
    value !== null && value !== undefined && value !== "").join(" ");
}

function hasSubjectConflict(messageSubjects, result) {
  if (!messageSubjects.size) return false;
  const subjectText = normalizeSearchText(result?.subject);
  if (!subjectText) return false;
  const resultSubjects = new Set(subjectText.split(" ").map(token => SUBJECT_ALIASES.get(token)).filter(Boolean));
  return resultSubjects.size > 0 && ![...messageSubjects].some(subject => resultSubjects.has(subject));
}

/**
 * Find catalogue rows whose own descriptive fields support the learner's topic.
 * The catalogue search has already applied its normal filters; this is a
 * conservative safety net for rows the LLM fit assessor may omit.
 */
export function findDeterministicallyRelevantIndexes(message, results) {
  if (!Array.isArray(results) || results.length === 0) return [];

  const tokens = getMessageTokens(message);
  if (tokens.length === 0) return [];

  const requestedGrade = getRequestedGrade(message);
  const requestedSubjects = getRequestedSubjects(tokens);
  const topicTokens = tokens.filter(token => !SUBJECT_ALIASES.has(token));
  if (topicTokens.length === 0) return [];

  const weightedFields = [
    { fields: ["topic"], weight: 5 },
    { fields: ["subtopic"], weight: 4 },
    { fields: ["activityName", "activity_name", "name"], weight: 4 },
    { fields: ["keywords", "keyword"], weight: 4 },
    { fields: ["description"], weight: 1 }
  ];

  const matches = [];
  results.forEach((result, index) => {
    if (!result || typeof result !== "object") return;

    if (requestedGrade !== null) {
      const resultGrade = getGradeNumber(result.grade ?? result.class ?? result.standard);
      if (resultGrade !== null && resultGrade !== requestedGrade) return;
    }
    if (hasSubjectConflict(requestedSubjects, result)) return;

    let score = 0;
    const matchedTokens = new Set();
    for (const field of weightedFields) {
      const text = normalizeSearchText(getFieldText(result, field.fields));
      if (!text) continue;
      const fieldTokens = new Set(text.split(" "));
      for (const token of topicTokens) {
        if (fieldTokens.has(token)) {
          score += field.weight;
          matchedTokens.add(token);
        }
      }
    }

    // Require at least one topic token in a meaningful catalogue field.
    // A single exact topic/name/keyword hit is sufficient; descriptions alone
    // are deliberately not enough to avoid retaining loosely related rows.
    if (matchedTokens.size > 0 && score >= 3.5) {
      matches.push({ index, score, matchedCount: matchedTokens.size });
    }
  });

  return matches
    .sort((a, b) => b.score - a.score || b.matchedCount - a.matchedCount || a.index - b.index)
    .map(item => item.index);
}

/** Keep the LLM's judgement, while independently retaining deterministic matches. */
export function mergeCatalogueResultIndexes(llmIndexes, deterministicIndexes, resultCount) {
  const validLlmIndexes = Array.isArray(llmIndexes)
    ? llmIndexes.filter(index => Number.isInteger(index) && index >= 0 && index < resultCount)
    : [];
  const validDeterministicIndexes = Array.isArray(deterministicIndexes)
    ? deterministicIndexes.filter(index => Number.isInteger(index) && index >= 0 && index < resultCount)
    : [];
  return [...new Set([...validLlmIndexes, ...validDeterministicIndexes])];
}
