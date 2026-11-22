/**
 * Deterministic extraction of catalogue search terms from the learner's text.
 * This is retrieval plumbing only; it does not generate or rewrite teaching content.
 */
export function buildDeterministicSearchArgs(message) {
  const original = String(message || "").trim();
  if (!original) return { q: "" };

  let text = original
    .replace(/[.!?;].*$/s, " ")
    .replace(/\b(?:class|grade)\s*\d{1,2}\b/ig, " ")
    .replace(/\b(?:for|in)\s+(?:my\s+)?(?:class|grade)\s*$/i, " ")
    .replace(/^\s*(?:please\s+)?/i, "")
    .replace(/^\s*(?:can|could|would)\s+you\s+/i, "")
    .replace(/^\s*(?:(?:i|we)\s+)?(?:want|would like|need|wish)\s+to\s+/i, "")
    .replace(/^\s*(?:teach\s+me|help\s+me(?:\s+understand|\s+with)?|tell\s+me\s+about|explain|define|describe|learn|study|understand|practice|practise|explore|show|find|list|search\s+for)\s+/i, "")
    .replace(/^\s*(?:available\s+)?(?:learning\s+)?(?:activities|resources|videos)\s+(?:for|about|on)\s+/i, "")
    .replace(/^\s*(?:about|on|regarding)\s+/i, "")
    .replace(/^\s*(?:what\s+is|what\s+are|who\s+is|how\s+does|how\s+do)\s+/i, "")
    .replace(/\b(?:with\s+examples?|in\s+simple\s+words?|for\s+beginners?|please)\b/ig, " ")
    .replace(/\s+(?:for|in|about|on|of)\s*$/i, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s,:-]+|[\s,:-]+$/g, "")
    .trim();

  // Remove leading articles and generic request words without destroying
  // meaningful multi-word concepts such as "Pythagoras theorem".
  text = text.replace(/^(?:(?:the|a|an)\s+)+/i, "").trim();
  const gradeMatch = original.match(/\b(class|grade)\s*(\d{1,2})\b/i);
  const grade = gradeMatch
    ? `${gradeMatch[1].toLowerCase() === "class" ? "Class" : "Grade"} ${gradeMatch[2]}`
    : "";

  return { q: text || original, ...(grade ? { grade } : {}) };
}

export function splitLearningConcepts(query) {
  return String(query || "")
    .split(/\s+(?:and|or|also)\s+|[,/&+]+/i)
    .map(value => value.trim())
    .filter(value => value && !/^(?:and|or|also)$/i.test(value));
}

export function isLearningRequest(message) {
  const text = String(message || "").trim();
  if (!text) return false;
  if (/^(?:hi(?: there)?|hello(?: there)?|hey(?: there)?|good morning|good afternoon|good evening|thanks|thank you|bye|goodbye|ok|okay|how are you(?: doing)?)[!.\s]*$/i.test(text)) return false;
  if (/\b(learn|learning|teach me|explain|understand|practice|practise|quiz|test me|lesson|study|how does|what is|what are|define|describe|help me)\b/i.test(text)) return true;
  if (/\b(?:class|grade)\s*\d{1,2}\b/i.test(text)) return true;
  // Short standalone topic phrases (e.g. "Nouns", "Fractions and decimals")
  // are valid learning requests even without an explicit verb.
  return text.split(/\s+/).length <= 5;
}

export function isTeachingRequest(message) {
  const text = String(message || "").trim();
  const activityDiscoveryRequest =
    /\b(find|show|list|browse|search for)\b.{0,50}\b(activities|resources|videos)\b/i.test(text) ||
    /\b(what|which)\b.{0,30}\b(activities|resources)\b.{0,30}\b(available|in the catalogue)\b/i.test(text);
  return !activityDiscoveryRequest && isLearningRequest(text);
}
