
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

import { searchLearningCatalog, getLearningCatalog } from "./learningCatalog.js";
import { getConversationMessage, getLearningLanguageConfig } from "./learningLanguageConfig.js";

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

function getTopicFromMessage(message, subject = "") {
  let text = normalize(message);

  // Remove grade references before extracting the actual learning topic.
  text = text
    .replace(/\b(?:class|grade|standard|std)\s*(?:number\s*)?\d{1,2}\b/g, " ")
    .replace(/\b(?:class|grade|standard|std)\s+(nursery|one|first|two|second|three|third|four|fourth|five|fifth|six|sixth|seven|seventh|eight|eighth|nine|ninth|ten|tenth)\b/g, " ")
    .replace(/\b(?:i am in|im in|i study in|studying in|im studying in|i am studying in)\s+(nursery|one|first|two|second|three|third|four|fourth|five|fifth|six|sixth|seven|seventh|eight|eighth|nine|ninth|ten|tenth|\d{1,2})\b/g, " ");

  // Remove the detected subject before extracting the actual topic phrase.
  if (subject) {
    const escapedSubject = normalize(subject).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (escapedSubject) text = text.replace(new RegExp(`\\b${escapedSubject}\\b`, "g"), " ");
  }

  // Language phrases and stop words are configured in learning-language.json.
  const languageRules = getLearningLanguageConfig().languageRules || {};
  const requestPhrases = Array.isArray(languageRules.requestPhrases)
    ? [...languageRules.requestPhrases].sort((a, b) => b.length - a.length)
    : [];

  for (const phrase of requestPhrases) {
    const escaped = String(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\b${escaped}\\b`, "g"), " ");
  }

  const stopWords = Array.isArray(languageRules.stopWords) ? languageRules.stopWords : [];
  if (stopWords.length) {
    const escapedWords = stopWords
      .map(word => String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length);
    text = text.replace(new RegExp(`\\b(?:${escapedWords.join("|")})\\b`, "g"), " ");
  }
  return text.replace(/\s+/g, " ").trim();
}

function findSemanticCatalogTopic(message, subject = "") {
  const text = normalize(message);
  const aliases = getLearningLanguageConfig().languageRules?.semanticAliases || [];
  const catalog = getLearningCatalog().filter(entry => !subject || normalize(entry.subject) === normalize(subject));

  for (const alias of aliases) {
    if (!alias || !Array.isArray(alias.phrases) || !alias.canonicalSubtopic) continue;
    if (alias.phrases.some(phrase => text.includes(normalize(phrase)))) {
      const item = catalog.find(entry => normalize(entry.subtopic) === normalize(alias.canonicalSubtopic));
      if (item) return { kind: "subtopic", value: item.subtopic, item, length: normalize(item.subtopic).length };
    }
  }
  return null;
}

function findAliasedCatalogTopic(message, subject = "") {
  const text = normalize(message);
  const catalog = getLearningCatalog().filter(entry => !subject || normalize(entry.subject) === normalize(subject));
  const aliases = getLearningLanguageConfig().languageRules?.catalogAliases || [];

  for (const alias of aliases) {
    if (!alias || !Array.isArray(alias.phrases) || !alias.canonicalField || !alias.canonicalValue) continue;
    const hasPhrase = alias.phrases.some(phrase => {
      const escaped = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return escaped && new RegExp(`\\b${escaped}\\b`).test(text);
    });
    if (!hasPhrase) continue;
    const item = catalog.find(entry => normalize(entry[alias.canonicalField]) === normalize(alias.canonicalValue));
    if (item) return { kind: alias.canonicalField, value: item[alias.canonicalField], item, length: normalize(item[alias.canonicalField]).length };
  }
  return null;
}

function detectBroadSubject(message) {
  const text = normalize(message);
  const subjects = getLearningLanguageConfig().languageRules?.broadSubjects || [];
  for (const subject of subjects) {
    if (!subject?.name || !Array.isArray(subject.phrases)) continue;
    const matches = subject.phrases.some(phrase => {
      const escaped = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return escaped && new RegExp(`\\b${escaped}\\b`).test(text);
    });
    if (!matches) continue;

    const context = subject.requestContextPhrases;
    if (!Array.isArray(context) || !context.length) return subject.name;
    if (context.some(phrase => {
      const escaped = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return escaped && new RegExp(`\\b${escaped}\\b`).test(text);
    })) return subject.name;
  }
  return "";
}

function detectCatalogSubject(message) {
  const text = normalize(message);
  const catalogSubjects = [...new Set(getLearningCatalog().map(item => item.subject).filter(Boolean))];
  const configuredSubjects = getLearningLanguageConfig().languageRules?.broadSubjects || [];
  const candidates = [];

  for (const name of catalogSubjects) {
    candidates.push({ name, phrases: [name] });
  }
  // Configured subjects must be recognized even when their catalog is not
  // registered yet. This is important for the AI fallback path: in
  // "learn fractions in Maths", "Maths" must be removed from the topic query.
  for (const configured of configuredSubjects) {
    if (!configured?.name || !Array.isArray(configured.phrases)) continue;
    const registeredName = catalogSubjects.find(name => normalize(name) === normalize(configured.name));
    candidates.push({ name: registeredName || configured.name, phrases: [configured.name, ...configured.phrases] });
  }

  // Keep common school subjects detectable if languageRules has not yet been
  // populated with broadSubjects. Registered catalog names take precedence.
  const defaultSubjects = [
    { name: "Maths", phrases: ["maths", "math", "mathematics"] },
    { name: "Science", phrases: ["science"] },
    { name: "English", phrases: ["english"] },
    { name: "Hindi", phrases: ["hindi"] },
    { name: "Social Science", phrases: ["social science", "social studies"] },
    { name: "EVS", phrases: ["evs", "environmental studies"] },
    { name: "Computer Science", phrases: ["computer science", "computers"] }
  ];
  for (const fallback of defaultSubjects) {
    const registeredName = catalogSubjects.find(name => normalize(name) === normalize(fallback.name));
    const configured = configuredSubjects.find(item => normalize(item?.name) === normalize(fallback.name));
    const phrases = configured?.phrases || fallback.phrases;
    candidates.push({ name: registeredName || configured?.name || fallback.name, phrases: [fallback.name, ...phrases] });
  }

  const matches = [];
  for (const candidate of candidates) {
    for (const phrase of candidate.phrases) {
      const normalizedPhrase = normalize(phrase);
      const escaped = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (escaped && new RegExp(`\\b${escaped}\\b`).test(text)) {
        matches.push({ name: candidate.name, length: normalizedPhrase.length });
      }
    }
  }
  matches.sort((a, b) => b.length - a.length);
  return matches[0]?.name || "";
}

function getSubjectRecommendations(subject, grade = "") {
  const catalog = getLearningCatalog().filter(item => normalize(item.subject) === normalize(subject));
  if (!catalog.length) return [];

  // Keep the existing curated English recommendations. Other subjects can
  // recommend all of their registered catalog entries until their own rules exist.
  if (normalize(subject) === "english") {
    const configuredTopics = getLearningLanguageConfig().languageRules?.recommendationTopics || [];
    const recommendationTopics = new Set(configuredTopics.map(normalize));
    return catalog.filter(item => recommendationTopics.has(normalize(item.topic)));
  }
  return catalog;
}

function filterResultsToGrade(results, grade) {
  if (!grade) return results;
  const wanted = normalize(grade);
  return results.filter(item => normalize(item.grade) === wanted);
}

function findCatalogTopic(message, subject = "") {
  const aliased = findAliasedCatalogTopic(message, subject);
  if (aliased) return aliased;

  const text = normalize(message);
  const catalog = getLearningCatalog().filter(item => !subject || normalize(item.subject) === normalize(subject));

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

function searchForLearningRequest(message, detectedGrade, aiIntent = null, subject = "") {
  // A class-only reply must use the topic already stored in conversation state.
  if (isGradeOnlyMessage(message)) return null;

  const catalog = getLearningCatalog().filter(item => !subject || normalize(item.subject) === normalize(subject));
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
  findAliasedCatalogTopic(message, subject) ||
  findCatalogTopic(message, subject) ||
  findSemanticCatalogTopic(message, subject);

  if (!requestedTerm && catalogMatch) {
    requestedTerm = catalogMatch.value;
    matchedCatalogItem = catalogMatch.item;
    matchedKind = catalogMatch.kind;
  }

  // Otherwise, extract the requested phrase from the message.
  if (!requestedTerm) {
    requestedTerm = getTopicFromMessage(message, subject);
  }

  if (!requestedTerm) return null;

  // Search across the descriptive CSV fields using the requested phrase.
  let results = searchLearningCatalog({
    q: requestedTerm,
    subject,
    limit: 100
  });

  // Restrict results to the detected class when one is available.
  if (detectedGrade) {
    results = filterByGrade(results, detectedGrade);
  }

  // Define every value used in the returned object.
  // If descriptive search found real CSV rows without an exact semantic match,
  // use the matched row's canonical topic/subtopic in the response.
  const firstMatchedItem = results[0] || null;

  const topic =
    matchedCatalogItem?.topic ||
    (matchedKind === "topic" ? requestedTerm : "") ||
    firstMatchedItem?.topic ||
    requestedTerm;

  const subtopic =
    matchedCatalogItem?.subtopic ||
    (matchedKind === "subtopic" ? requestedTerm : "") ||
    firstMatchedItem?.subtopic ||
    "";

  return {
    topic,
    subtopic,
    grade: detectedGrade || null,
    subject: subject || matchedCatalogItem?.subject || firstMatchedItem?.subject || "",
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
    subject: item.subject || "",
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
    subject: "",
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
      subject: state.subject || "",
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
  const requestedSubject = detectCatalogSubject(originalMessage);
  const detectedGrade = extractGrade(originalMessage) ||
    (aiIntent?.intent === "learn" ? searchForLearningRequest(originalMessage, "", aiIntent, requestedSubject)?.grade || "" : "");
  const newLearningRequest = searchForLearningRequest(originalMessage, detectedGrade, aiIntent, requestedSubject);
  
  const isNewTopicWithGrade = Boolean(
    detectedGrade && newLearningRequest && !isGradeOnlyMessage(originalMessage)
  );
  const broadSubject = detectBroadSubject(originalMessage) ||
    (requestedSubject && !getTopicFromMessage(originalMessage, requestedSubject) ? requestedSubject : "");

  // Broad subject requests are recommendations, not literal keyword searches.
  // Only return resources that actually exist in the catalog.
  if (broadSubject && !newLearningRequest) {
    state.topic = broadSubject;
    state.subtopic = "";
    state.subject = broadSubject;
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

    const hasRecommendations = visibleRecommendations.length > 0;
    const reply = hasRecommendations
      ? `Here are learning activities for ${broadSubject}${state.grade ? ` (${state.grade})` : ""}. You can choose one or ask for a specific topic.`
      : `I couldn't find activities for ${broadSubject}${state.grade ? ` in ${state.grade}` : ""} in the current catalog. You can ask for a specific topic or try another subject.`;

    return respond(
      reply,
      visibleRecommendations.slice(0, state.shownCount),
      { intent: hasRecommendations ? "subject_recommendations" : "subject_not_available", requestedSubject: broadSubject, total: visibleRecommendations.length }
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
    state.subject = learningRequest.subject || requestedSubject || "";
    // A new topic should not inherit the previous topic's class.
    state.grade = detectedGrade || learningRequest.grade || "";
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
  if (!state) return { topic: "", subtopic: "", subject: "", grade: "" };
  return {
    topic: state.topic || "",
    subtopic: state.subtopic || "",
    subject: state.subject || "",
    grade: state.grade || ""
  };
}
