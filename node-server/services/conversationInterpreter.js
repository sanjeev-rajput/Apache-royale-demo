
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

import { searchLearningCatalog, getLearningCatalog } from "./learningCatalog.js";
import { getConversationMessage } from "./learningLanguageConfig.js";

const nlp = winkNLP(model);
const its = nlp.its;

// In-memory conversation state.
// For production or multiple Node processes, use a shared store.
const conversations = new Map();

function normalize(value = "") {
  return String(value)
    // Remove a numbered-list prefix before punctuation is stripped.
    .replace(/^\s*\d+[.)]\s*/, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTokens(message) {
  try {
    return nlp.readDoc(message).tokens().out(its.value);
  } catch {
    return normalize(message).split(" ").filter(Boolean);
  }
}

const numberWords = {
  one: 1,
  first: 1,
  two: 2,
  second: 2,
  three: 3,
  third: 3,
  four: 4,
  fourth: 4,
  five: 5,
  fifth: 5,
  six: 6,
  sixth: 6,
  seven: 7,
  seventh: 7,
  eight: 8,
  eighth: 8,
  nine: 9,
  ninth: 9,
  ten: 10,
  tenth: 10
};

function gradeLabel(number) {
  return `Class ${number}`;
}

function extractGrade(message) {
  const text = normalize(message);

  // Nursery
  if (/\bnursery\b/.test(text)) {
    return "Nursery";
  }

  // Numeric forms: class 3, grade 3, standard 3, etc.
  const numericMatch = text.match(
    /\b(?:class|grade|standard|std)\s*(?:number\s*)?(\d{1,2})\b/
  );

  if (numericMatch) {
    const number = Number(numericMatch[1]);

    if (number >= 1 && number <= 12) {
      return gradeLabel(number);
    }
  }

  // Word forms: class three, third standard, etc.
  const wordPattern =
    /\b(?:class|grade|standard|std)\s+(one|first|two|second|three|third|four|fourth|five|fifth|six|sixth|seven|seventh|eight|eighth|nine|ninth|ten|tenth)\b/;

  const wordMatch = text.match(wordPattern);

  if (wordMatch) {
    return gradeLabel(numberWords[wordMatch[1]]);
  }

  // Conversational forms:
  // "I'm in third"
  // "I study in 5"
  // "I am in Nursery"
  const conversationalMatch = text.match(
    /\b(?:i am in|im in|i study in|studying in|im studying in|i am studying in)\s+(nursery|one|first|two|second|three|third|four|fourth|five|fifth|six|sixth|seven|seventh|eight|eighth|nine|ninth|ten|tenth|\d{1,2})(?:\s+(?:class|grade|standard|std))?\b/
  );

  if (conversationalMatch) {
    const value = conversationalMatch[1];

    if (value === "nursery") {
      return "Nursery";
    }

    const number = numberWords[value] || Number(value);

    if (number >= 1 && number <= 12) {
      return gradeLabel(number);
    }
  }

  return "";
}

// A message that only supplies a class should update the current conversation,
// not be interpreted as a new topic search (for example, "Class 2").
function isGradeOnlyMessage(message) {
  const text = normalize(message);
  if (!extractGrade(text)) return false;

  const remaining = text
    .replace(/\b(?:class|grade|standard|std)\s*(?:number\s*)?(?:\d{1,2}|nursery|one|first|two|second|three|third|four|fourth|five|fifth|six|sixth|seven|seventh|eight|eighth|nine|ninth|ten|tenth)\b/g, " ")
    .replace(/\b(?:i am in|im in|i study in|studying in|im studying in|i am studying in)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return remaining.length === 0;
}

function isAllClassesRequest(text) {
  return /\b(all classes|all grades|every class|any class)\b/.test(text);
}

function isMoreRequest(text) {
  return /\b(more|show more|more activities|more results|next|another one|another activity|show another one|show another activity|show me another one|show me another activity|give me another one|give me another activity)\b/.test(text);
}

function isAnotherClassRequest(text) {
  return /\b(another class|different class|other class|change class)\b/.test(text);
}

function isNextStepRequest(text) {
  return /\b(what next|whats next|next step|what should i learn next)\b/.test(text);
}

function isGreeting(text) {
  return /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text);
}

function getTopicFromMessage(message) {
  let text = normalize(message);

  // Remove grade references before extracting the actual learning topic.
  text = text
    .replace(/\b(?:class|grade|standard|std)\s*(?:number\s*)?\d{1,2}\b/g, " ")
    .replace(/\b(?:class|grade|standard|std)\s+(nursery|one|first|two|second|three|third|four|fourth|five|fifth|six|sixth|seven|seventh|eight|eighth|nine|ninth|ten|tenth)\b/g, " ")
    .replace(/\b(?:i am in|im in|i study in|studying in|im studying in|i am studying in)\s+(nursery|one|first|two|second|three|third|four|fourth|five|fifth|six|sixth|seven|seventh|eight|eighth|nine|ninth|ten|tenth|\d{1,2})\b/g, " ");

  // Longer phrases must be removed first (e.g. "can you teach me about").
  const requestPhrases = [
    "i would like to learn about", "i would like to learn",
    "i want to learn about", "i want to learn",
    "can you teach me about", "can you teach me",
    "i want activities about", "i need help with", "help me with",
    "teach me about", "teach me", "learn about", "learn",
    "activities about", "show me", "i want to study", "study about"
  ].sort((a, b) => b.length - a.length);

  for (const phrase of requestPhrases) {
    text = text.replace(new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), " ");
  }

  // These words describe the request, not the subject being requested.
  text = text.replace(/\b(please|today|tonight|now|then|about|the|a|an|for|my|what|which|how|me|i|want|to|learn|show|more|some|anything|something|anything|activity|activities|exercise|exercises|in|on|can|you|teach|lets|let|us|yes|ok|okay)\b/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

function findSemanticCatalogTopic(message) {
  const text = normalize(message);
  const aliases = [
    { phrases: ["words that name things", "words that name people places and things", "naming words"], subtopic: "Nouns" },
    { phrases: ["action words", "words that show action", "words that tell what someone does"], subtopic: "Verbs" },
    { phrases: ["describing words", "words that describe nouns", "words that tell us more about a noun"], subtopic: "Adjectives" },
    { phrases: ["words that replace nouns", "words used instead of nouns"], subtopic: "Pronouns" }
  ];
  const catalog = getLearningCatalog();
  for (const alias of aliases) {
    if (alias.phrases.some(phrase => text.includes(normalize(phrase)))) {
      const item = catalog.find(entry => normalize(entry.subtopic) === normalize(alias.subtopic));
      if (item) return { kind: "subtopic", value: item.subtopic, item, length: normalize(item.subtopic).length };
    }
  }
  return null;
}

function findAliasedCatalogTopic(message) {
  const text = normalize(message);
  const catalog = getLearningCatalog();
  const aliases = [
    { patterns: [/\bnumber\b/, /\bnumbers\b/, /\bcounting\b/, /\bnumeracy\b/], kind: "subtopic", value: "Numbers" },
    { patterns: [/\balphabet\b/, /\balphabets\b/, /\bletters\b/, /\babc\b/], kind: "subtopic", value: "My Alphabet" },
    { patterns: [/\bwords\b/, /\bvocabulary\b/], kind: "topic", value: "Vocabulary" }
  ];

  for (const alias of aliases) {
    if (!alias.patterns.some(pattern => pattern.test(text))) continue;
    const item = catalog.find(entry => normalize(entry[alias.kind]) === normalize(alias.value));
    if (item) return { kind: alias.kind, value: item[alias.kind], item, length: normalize(item[alias.kind]).length };
  }
  return null;
}

function detectBroadSubject(message) {
  const text = normalize(message);
  if (/\b(math|maths|mathematics|arithmetic)\b/.test(text)) return "Maths";
  if (/\b(english|language|reading|writing|grammar|phonics|vocabulary)\b/.test(text) &&
      /\b(anything|something|teach|learn|study|subject|topic|help|want|like)\b/.test(text)) return "English";
  return "";
}

function getSubjectRecommendations(subject, grade = "") {
  const catalog = getLearningCatalog();
  if (subject === "Maths") {
    // The current catalog contains English/literacy topics, not a Maths topic.
    return [];
  }
  const literacyTopics = new Set(["grammar", "phonics", "writing", "vocabulary", "reading", "rhymes"]);
  return catalog.filter(item => literacyTopics.has(normalize(item.topic)));
}

function filterResultsToGrade(results, grade) {
  if (!grade) return results;
  const wanted = normalize(grade);
  return results.filter(item => normalize(item.grade) === wanted);
}

function findCatalogTopic(message) {
  const aliased = findAliasedCatalogTopic(message);
  if (aliased) return aliased;

  const text = normalize(message);
  const catalog = getLearningCatalog();

  // Prefer an exact catalog topic or subtopic phrase found in the message.
  const candidates = [];
  for (const item of catalog) {
    for (const [kind, value] of [["topic", item.topic], ["subtopic", item.subtopic]]) {
      const normalizedValue = normalize(value || "");
      if (normalizedValue && text.includes(normalizedValue)) {
        candidates.push({ kind, value, item, length: normalizedValue.length });
      }
    }
  }

  candidates.sort((a, b) => b.length - a.length);
  return candidates[0] || null;
}

function searchForLearningRequest(message, detectedGrade, aiIntent = null) {
  // A class-only reply must use the topic already stored in conversation state.
  if (isGradeOnlyMessage(message)) return null;

  const catalog = getLearningCatalog();
  const normalizeValue = value => normalize(value || "");

  let requestedTerm = "";
  let matchedCatalogItem = null;
  let matchedKind = "";

  // First, use the AI intent to identify a matching catalog topic or subtopic.
  if (aiIntent?.intent === "learn") {
    const aiSubtopic = normalizeValue(aiIntent.subtopic);
    const aiTopic = normalizeValue(aiIntent.topic);

    if (aiSubtopic) {
      matchedCatalogItem = catalog.find(item =>
        normalizeValue(item.subtopic) === aiSubtopic &&
        (!aiTopic || normalizeValue(item.topic) === aiTopic)
      ) || null;

      if (matchedCatalogItem) {
        requestedTerm = matchedCatalogItem.subtopic;
        matchedKind = "subtopic";
      }
    }

    if (!requestedTerm && aiTopic) {
      matchedCatalogItem = catalog.find(item =>
        normalizeValue(item.topic) === aiTopic
      ) || null;

      if (matchedCatalogItem) {
        requestedTerm = matchedCatalogItem.topic;
        matchedKind = "topic";
      }
    }
  }

  // Prefer known aliases and catalog phrases in the user's message.
  const catalogMatch =
  findAliasedCatalogTopic(message) ||
  findCatalogTopic(message) ||
  findSemanticCatalogTopic(message);

  if (!requestedTerm && catalogMatch) {
    requestedTerm = catalogMatch.value;
    matchedCatalogItem = catalogMatch.item;
    matchedKind = catalogMatch.kind;
  }

  // Otherwise, extract the requested phrase from the message.
  if (!requestedTerm) {
    requestedTerm = getTopicFromMessage(message);
  }

  if (!requestedTerm) return null;

  // Search across the descriptive CSV fields using the requested phrase.
  let results = searchLearningCatalog({
    q: requestedTerm,
    limit: 100
  });

  // Restrict results to the detected class when one is available.
  if (detectedGrade) {
    results = filterByGrade(results, detectedGrade);
  }

  // Define every value used in the returned object.
  const topic =
    matchedCatalogItem?.topic ||
    (matchedKind === "topic" ? requestedTerm : "");

  const subtopic =
    matchedCatalogItem?.subtopic ||
    (matchedKind === "subtopic" ? requestedTerm : "");

  return {
    topic,
    subtopic,
    grade: detectedGrade || null,
    results
  };
}

function filterByGrade(results, grade) {
  if (!grade) return results;

  const wanted = normalize(grade);

  return results.filter(
    item => normalize(item.grade) === wanted
  );
}

function makeActivityResponse(results) {
  return results.map(item => ({
    grade: item.grade,
    topic: item.topic,
    subtopic: item.subtopic,
    activityType: item.activityType,
    activityName: item.activityName,
    description: item.description,
    location: item.location,
    source: item.source
  }));
}

export function handleLearningChat({
  conversationId,
  message,
  aiIntent = null
}) {
  const id = String(conversationId || "").trim();
  const originalMessage = String(message || "").trim();

  if (!id) {
    return {
      status: 400,
      body: { error: "conversationId is required" }
    };
  }

  if (!originalMessage) {
    return {
      status: 400,
      body: { error: "message is required" }
    };
  }

  const text = normalize(originalMessage);
  const tokens = getTokens(originalMessage);

  let state = conversations.get(id) || {
    topic: "",
    subtopic: "",
    grade: "",
    waitingForGrade: false,

    // All matches for the current topic, regardless of class.
    topicResults: [],

    // Results currently being displayed.
    results: [],

    shownCount: 0
  };

  // Backward compatibility if an older state has no topicResults.
  if (!Array.isArray(state.topicResults)) {
    state.topicResults = state.results || [];
  }
  if (typeof state.subtopic !== "string") state.subtopic = "";

  const respond = (reply, results = [], extra = {}) => ({
    status: 200,
    body: {
      conversationId: id,
      reply,
      intent: extra.intent || "unknown",
      topic: state.topic,
      subtopic: state.subtopic || "",
      grade: state.grade,
      waitingForGrade: state.waitingForGrade,
      results: makeActivityResponse(results),
      ...extra
    }
  });

  // Greeting
  if (isGreeting(text)) {
    conversations.set(id, state);

    return respond(
      getConversationMessage("welcome"),
      [],
      { intent: "greeting" }
    );
  }

  // Show activities across all classes.
  if (isAllClassesRequest(text)) {
    state.grade = "";
    state.waitingForGrade = false;

    // Reuse the complete topic result set.
    state.results = state.topicResults;
    state.shownCount = Math.min(10, state.results.length);

    conversations.set(id, state);

    return respond(
      state.results.length
        ? getConversationMessage("activitiesAcrossClasses", { topic: state.subtopic || state.topic || "your topic" })
        : getConversationMessage("noActivities", { topic: state.topic || "that topic" }),
      state.results.slice(0, state.shownCount),
      {
        intent: "show_all_classes",
        total: state.results.length
      }
    );
  }

  // Detect grade and catalog topic together, e.g. "Grammar for Class 1".
  const detectedGrade = extractGrade(originalMessage) ||
    (aiIntent?.intent === "learn" ? searchForLearningRequest(originalMessage, "", aiIntent)?.grade || "" : "");
  const newLearningRequest = searchForLearningRequest(originalMessage, detectedGrade, aiIntent);
  
  const isNewTopicWithGrade = Boolean(
    detectedGrade && newLearningRequest && !isGradeOnlyMessage(originalMessage)
  );
  const broadSubject = detectBroadSubject(originalMessage);

  // Broad subject requests are recommendations, not literal keyword searches.
  // Only return resources that actually exist in the catalog.
  if (broadSubject) {
    state.topic = broadSubject;
    state.subtopic = "";
    if (detectedGrade) state.grade = detectedGrade;
    const recommendations = getSubjectRecommendations(broadSubject);
    const visibleRecommendations = state.grade
      ? filterByGrade(recommendations, state.grade)
      : recommendations;
    state.topicResults = recommendations;
    state.results = visibleRecommendations;
    state.shownCount = Math.min(10, visibleRecommendations.length);
    state.waitingForGrade = !state.grade;
    conversations.set(id, state);

    if (broadSubject === "Maths") {
      return respond(
        "I don't currently have Maths activities in my learning catalog. You can tell me a specific Maths topic, or explore the English activities available here.",
        [],
        { intent: "subject_not_available", requestedSubject: "Maths", total: 0 }
      );
    }

    return respond(
      visibleRecommendations.length
        ? `Of course! Here are some English learning activities${state.grade ? ` for ${state.grade}` : ""}. You can choose one, or tell me whether you prefer reading, phonics, grammar, writing or vocabulary.`
        : `I'd be happy to help with English. I couldn't find matching catalog activities${state.grade ? ` for ${state.grade}` : ""}. Would you like to try another class or explore a different topic?`,
      visibleRecommendations.slice(0, state.shownCount),
      { intent: "subject_recommendations", requestedSubject: "English", total: visibleRecommendations.length }
    );
  }

  // A grade-only reply should apply to the topic already stored in this conversation.
  if (detectedGrade && !isNewTopicWithGrade) {
    state.grade = detectedGrade;
    state.waitingForGrade = false;

    // Always filter from the complete topic results.
    const gradeResults = filterByGrade(
      state.topicResults,
      detectedGrade
    );
    

    if (gradeResults.length > 0) {
      // Exact class matches were found.
      state.results = gradeResults;
      state.shownCount = Math.min(10, gradeResults.length);

      conversations.set(id, state);

      return respond(
        getConversationMessage("activitiesFound", { topic: state.subtopic || state.topic, grade: detectedGrade }),
        state.results.slice(0, state.shownCount),
        {
          intent: "set_grade",
          total: gradeResults.length
        }
      );
    }

    // No exact class match: show related topic activities as a fallback.
    // Keep the requested grade in state; do not label fallback activities
    // as if they belonged to that grade.
    state.results = state.topicResults;
    state.shownCount = Math.min(10, state.results.length);

    conversations.set(id, state);

    const fallbackGrades = [
      ...new Set(
        state.topicResults
          .map(item => item.grade)
          .filter(Boolean)
      )
    ];

    const fallbackMessage = state.results.length
      ? `I couldn't find activities about ${state.topic} for ${detectedGrade}. Here are related activities I found in ${fallbackGrades.join(", ")}. These are not ${detectedGrade} activities. You can ask to see all classes or try another class.`
      : `I couldn't find activities about ${state.topic} for ${detectedGrade}, and I don't have related activities to show. Would you like to try another topic?`;

    return respond(
      fallbackMessage,
      state.results.slice(0, state.shownCount),
      {
        intent: "grade_no_match",
        requestedGrade: detectedGrade,
        fallbackGrades,
        total: state.results.length
      }
    );
  }

  // Ask for a different class.
  if (isAnotherClassRequest(text)) {
    state.waitingForGrade = true;

    conversations.set(id, state);

    return respond(
      getConversationMessage("askForDifferentClass"),
      [],
      { intent: "change_grade" }
    );
  }

  // Show additional results from the currently selected result set.
  if (isMoreRequest(text)) {
    const next = state.results.slice(
      state.shownCount,
      state.shownCount + 10
    );

    state.shownCount += next.length;
    conversations.set(id, state);

    return respond(
      next.length
        ? "Here are some more activities."
        : getConversationMessage("noMoreActivities"),
      next,
      {
        intent: "more",
        total: state.results.length
      }
    );
  }

  // Suggest a next step based on the current results.
  if (isNextStepRequest(text)) {
    const nextTopic = state.results.find(
      item =>
        item.subtopic &&
        normalize(item.subtopic) !== normalize(state.topic)
    )?.subtopic;

    conversations.set(id, state);

    return respond(
      nextTopic
        ? `You could continue with ${nextTopic}. Would you like me to find activities for it?`
        : `You can choose another topic, or ask me to show more activities about ${state.topic}.`,
      [],
      {
        intent: "next_step",
        suggestedTopic: nextTopic || ""
      }
    );
  }

  // New learning request: recognize catalog topics/subtopics and optional grade.
  const learningRequest = newLearningRequest || searchForLearningRequest(originalMessage, "", aiIntent);

  if (learningRequest) {
    state.topic = learningRequest.topic;
    state.subtopic = learningRequest.subtopic || "";
    state.grade = detectedGrade || learningRequest.grade || state.grade || "";
    const requestGrade = state.grade;
    state.waitingForGrade = !requestGrade;

    const results = learningRequest.results;
    state.topicResults = results;
    // Apply the remembered/requested class to the visible results as well.
    const visibleResults = requestGrade ? filterByGrade(results, requestGrade) : results;
    state.results = visibleResults;
    state.shownCount = Math.min(10, visibleResults.length);

    conversations.set(id, state);

    if (requestGrade) {
      return respond(
        visibleResults.length
          ? getConversationMessage("activitiesFound", { topic: state.subtopic || state.topic, grade: requestGrade })
          : getConversationMessage("noActivitiesForGrade", { topic: state.subtopic || state.topic, grade: requestGrade }),
        state.results.slice(0, state.shownCount),
        {
          intent: visibleResults.length ? "search_topic" : "grade_no_match",
          requestedGrade: requestGrade,
          total: visibleResults.length
        }
      );
    }

    return respond(
      results.length
        ? getConversationMessage("askForGrade", { topic: state.subtopic || state.topic })
        : getConversationMessage("noActivities", { topic: state.subtopic || state.topic }),
      [],
      {
        intent: "search_topic",
        total: results.length
      }
    );
  }

  conversations.set(id, state);

  return respond(
    getConversationMessage("askForTopic"),
    [],
    {
      intent: "clarify",
      tokens
    }
  );
}

// Expose only the current learning context to independent modules such as practice mode.
export function getLearningConversationContext(conversationId) {
  const id = String(conversationId || "").trim();
  const state = conversations.get(id);
  if (!state) return { topic: "", subtopic: "", grade: "" };
  return {
    topic: state.topic || "",
    subtopic: state.subtopic || "",
    grade: state.grade || ""
  };
}
