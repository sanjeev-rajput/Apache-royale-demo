// Complete updated agentEngine.js — copy this file over agent/agentEngine.js
// Includes SME profile integration and planner-only structured observation compaction.

import { createAgentLlmSession, AgentLlmUnavailableError } from "./agentLlmResilience.js";

import { executeAgentTool } from "./agentTools.js";
import { searchYouTubeVideos } from "../services/youtubeService.js";
import { loadInstructionsForCatalogueResults } from "./agentConfigLoader.js";
import { AGENT_ACTIONS, PLANNER_PROMPT } from "./agentPlanner.js";
import {
  evaluateCatalogueRelevance,
  getRecommendedCatalogueIndexes
} from "./catalogueRelevance.js";

const MAX_AGENT_STEPS = 4;
const MAX_HISTORY_MESSAGES = 8;
const MAX_OBSERVATION_CHARS = 16000;

const AGENT_SYSTEM_PROMPT = `
You are Agentic Learning, a friendly, age-appropriate K-12 learning companion.

For a learner who asks to learn or understand a topic, teach the topic yourself
even when matching CSV catalogue activities exist. Start with a short, grade-
appropriate explanation, give simple examples, and then provide three practice
questions unless the learner requests a different number or format.

When the CSV catalogue does not fully satisfy the learner's request, create the
missing educational content yourself. This may include explanations, examples,
quizzes, exercises, questions or step-by-step guidance.

Use catalogue observations only for real activities actually returned by the
catalogue. Never invent activity names, links, grades, subjects or catalogue
content. Do not print raw activity URLs; the application renders catalogue
activities separately as clickable cards.

Keep the language and difficulty suitable for the learner's stated grade.
If the learner requests a specific number of questions, provide exactly that
number. Do not repeat explanations the learner explicitly asked you not to
repeat. Do not mention internal tools, planner steps or JSON.
`;

const CATALOGUE_FIT_PROMPT = `
You are checking whether real CSV catalogue results fulfil a learner's request.
Be strict: a related resource is not automatically a fulfilment of the request.

Return JSON with:
- catalogueSatisfiesRequest: boolean
- relevantResultIndexes: array of zero-based indexes from the supplied results
- reason: short explanation

Rules:
- Include only results relevant to the learner's actual topic, grade and subject.
- If the learner asks for a specific deliverable such as five questions, a
  written explanation, examples, or a quiz, a generic related activity does
  not satisfy that deliverable unless the CSV result clearly provides it.
- A relevant related activity may still be returned alongside an LLM fallback.
- If no result is relevant, return an empty relevantResultIndexes array.
- Do not assume activity types from natural-language words. Judge the actual
  CSV fields and description.
`;

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(item => item && ["user", "assistant"].includes(item.role) &&
      typeof item.content === "string")
    .slice(-MAX_HISTORY_MESSAGES);
}

function normalizePlan(plan) {
  const action = Object.values(AGENT_ACTIONS).includes(plan?.action)
    ? plan.action
    : AGENT_ACTIONS.ANSWER;

  const args = plan?.arguments && typeof plan.arguments === "object" &&
    !Array.isArray(plan.arguments) ? { ...plan.arguments } : {};

  if (action === AGENT_ACTIONS.SEARCH && !args.q && args.topic) {
    args.q = args.topic;
    delete args.topic;
  }

  // If the planner repeats the searchable concept in both q and topic,
  // do not accidentally turn that concept into an exact CSV topic filter.
  if (action === AGENT_ACTIONS.SEARCH && args.q && args.topic &&
      String(args.q).trim().toLowerCase() === String(args.topic).trim().toLowerCase()) {
    delete args.topic;
  }

  // Nulls must not override defaults in the existing catalogue function.
  for (const key of Object.keys(args)) {
    if (args[key] === null || args[key] === undefined ||
        (typeof args[key] === "string" && args[key].trim() === "")) {
      delete args[key];
    }
  }

  return { action, arguments: args };
}

function makeCallKey(action, args) {
  const stableArgs = Object.keys(args || {}).sort().reduce((out, key) => {
    out[key] = args[key];
    return out;
  }, {});
  return `${action}:${JSON.stringify(stableArgs)}`;
}

function compactObservation(value) {
  // Catalogue observations sent to the planner need only descriptive fields.
  // The complete catalogue records remain untouched in the internal observations.
  if (Array.isArray(value)) {
    const fieldLimits = {
      grade: 40,
      subject: 60,
      topic: 120,
      subtopic: 120,
      activityType: 60,
      activityName: 180,
      keywords: 240,
      description: 360
    };

    const fields = Object.keys(fieldLimits);
    const compactResults = value.slice(0, 10).map(item => {
      const compactItem = {};

      for (const field of fields) {
        const text = String(item?.[field] ?? "");
        compactItem[field] = text.slice(0, fieldLimits[field]);
      }

      return compactItem;
    });

    let serialized = JSON.stringify(compactResults);

    // Drop trailing planner-only records if the payload is still too large.
    while (
      serialized.length > MAX_OBSERVATION_CHARS &&
      compactResults.length > 1
    ) {
      compactResults.pop();
      serialized = JSON.stringify(compactResults);
    }

    return serialized;
  }

  // Filter observations and other non-array values remain valid JSON.
  return JSON.stringify(value);
}

function buildPlannerPayload(message, history, observations, step) {
  return {
    learnerMessage: message,
    conversationHistory: history,
    step,
    maximumSteps: MAX_AGENT_STEPS,
    // Compact only the copy sent to the planner. Internal observations retain
    // the complete catalogue records for relevance, SME profiles and cards.
    toolObservations: observations.map(observation => ({
      ...observation,
      ...(observation.result !== undefined
        ? { result: compactObservation(observation.result) }
        : {})
    }))
  };
}

function parseObservationResult(observation) {
  if (!observation || observation.result == null) return null;

  // Internal observations now retain their original objects.
  if (typeof observation.result !== "string") {
    return observation.result;
  }

  try {
    return JSON.parse(observation.result);
  } catch {
    return null;
  }
}

function isTeachingRequest(message) {
  // A request to learn a subject needs teaching prose, not just catalogue cards.
  // Explicit activity-discovery requests can still use the catalogue-only path.
  const text = String(message || "").trim();

  const activityDiscoveryRequest =
    /\b(find|show|list|browse|search for)\b.{0,40}\b(activities|resources|videos)\b/i.test(text) ||
    /\b(what|which)\b.{0,30}\b(activities|resources)\b.{0,30}\b(available|in the catalogue)\b/i.test(text);

  if (activityDiscoveryRequest) return false;

  return /\b(learn|teach me|explain|understand|practice|practise|quiz|test me|lesson|study|how does|what is|what are)\b/i.test(text);
}

function buildCatalogueOnlyReply(results) {
  if (!Array.isArray(results) || results.length === 0) return "";
  const names = results.map(item => item.activityName).filter(Boolean);
  if (names.length === 1) {
    return `I found a learning activity in our catalogue: **${names[0]}**. You can open the activity card below to start learning.`;
  }
  return `I found ${names.length} learning activities in our catalogue. You can explore them using the activity cards below.`;
}

function buildFiltersReply(filters) {
  if (!filters || typeof filters !== "object") return "";
  const list = values => Array.isArray(values) && values.length
    ? values.join(", ") : "Not available in the catalogue.";
  return [
    "Here is what is currently available in the learning catalogue:",
    `**Grades:** ${list(filters.grades)}`,
    `**Subjects:** ${list(filters.subjects)}`,
    `**Topics:** ${list(filters.topics)}`,
    `**Activity types:** ${list(filters.activityTypes)}`
  ].join("\n\n");
}

async function assessCatalogueFit(message, history, results, llm) {
  if (!Array.isArray(results) || results.length === 0) {
    return { catalogueSatisfiesRequest: false, relevantResultIndexes: [], reason: "No catalogue results." };
  }

  let assessment;
  try {
    assessment = await llm.generateStructuredResponse({
      systemPrompt: CATALOGUE_FIT_PROMPT,
      userPayload: { learnerMessage: message, conversationHistory: history, catalogueResults: results },
      temperature: 0,
      maxTokens: 300
    });
  } catch (error) {
    // An account-level 429 is request-wide: do not continue to another LLM
    // operation after the provider has told us the account limit is exhausted.
    if (error instanceof AgentLlmUnavailableError && error.accountLimit) throw error;
    console.warn("[Agent Catalogue Fit] Assessment failed; using LLM fallback:", error.message);
    return { catalogueSatisfiesRequest: false, relevantResultIndexes: [], reason: "Catalogue suitability could not be verified." };
  }

  const indexes = Array.isArray(assessment?.relevantResultIndexes)
    ? assessment.relevantResultIndexes.filter(index =>
        Number.isInteger(index) && index >= 0 && index < results.length)
    : [];

  return {
    catalogueSatisfiesRequest: assessment?.catalogueSatisfiesRequest === true && indexes.length > 0,
    relevantResultIndexes: indexes,
    reason: typeof assessment?.reason === "string" ? assessment.reason : ""
  };
}

async function attachYouTubeVideos(response, learnerMessage, searchObservation) {
  // Only search YouTube when the existing planner performed a learning
  // catalogue search. Greetings and general conversations remain unchanged.
  if (!searchObservation) {
    return { ...response, videos: [] };
  }

  try {
    const searchArgs = searchObservation.arguments || {};
    const topic = searchArgs.q || searchArgs.topic || learnerMessage;

    const videos = await searchYouTubeVideos({
      topic,
      grade: searchArgs.grade || "",
      subject: searchArgs.subject || "",
      limit: 5
    });

    console.log(`[Agent YouTube] Attached ${videos.length} videos.`);

    return {
      ...response,
      videos: Array.isArray(videos) ? videos : []
    };
  } catch (error) {
    // Optional video discovery must never fail the learning response.
    console.warn("[Agent YouTube] Optional search failed:", error.message);
    return { ...response, videos: [] };
  }
}

async function runLearningAgentInternal({ message, history = [], onLlmStatus }) {
  const llm = createAgentLlmSession({ onStatus: onLlmStatus });
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("A valid learner message is required.");
  }

  const learnerMessage = message.trim();
  const recentHistory = cleanHistory(history);
  const observations = [];
  const executedCalls = new Set();
  let finalAction = AGENT_ACTIONS.ANSWER;
  let plannerSteps = 0;

  // CSV-first agent loop: plan -> search/observe -> plan again.
  for (let step = 1; step <= MAX_AGENT_STEPS; step += 1) {
    plannerSteps = step;
    const rawPlan = await llm.generateStructuredResponse({
      systemPrompt: PLANNER_PROMPT,
      userPayload: buildPlannerPayload(learnerMessage, recentHistory, observations, step),
      temperature: 0,
      maxTokens: 300
    });

    const plan = normalizePlan(rawPlan);
    finalAction = plan.action;
    console.log(`[Agent Planner] step=${step} action=${plan.action}`, JSON.stringify(plan.arguments));

    if (plan.action === AGENT_ACTIONS.ANSWER) break;

    const callKey = makeCallKey(plan.action, plan.arguments);
    if (executedCalls.has(callKey)) {
      observations.push({ action: plan.action, arguments: plan.arguments,
        error: "This exact tool request was already executed. Use its prior result." });
      break;
    }
    executedCalls.add(callKey);

    try {
      const result = await executeAgentTool(plan.action, plan.arguments);

      observations.push({
        step,
        action: plan.action,
        arguments: plan.arguments,
        result
      });
    } catch (error) {
      observations.push({ step, action: plan.action, arguments: plan.arguments,
        error: error.message || "Tool execution failed." });
    }
  }

  // Availability questions are answered directly from catalogue filter data.
  const filtersObservation = [...observations].reverse()
    .find(item => item.action === AGENT_ACTIONS.FILTERS && item.result);
  const hasSearchObservation = observations.some(item =>
    item.action === AGENT_ACTIONS.SEARCH && item.result);
  if (filtersObservation && !hasSearchObservation) {
    const filters = parseObservationResult(filtersObservation);
    const reply = buildFiltersReply(filters);
    if (reply) {
      return {
        reply,
        action: AGENT_ACTIONS.FILTERS,
        results: null,
        contentSource: "catalogue",
        showAiWarning: false,
        agent: { steps: plannerSteps, maxSteps: MAX_AGENT_STEPS, completed: true }
      };
    }
  }

  const searchObservations = observations.filter(item =>
    item.action === AGENT_ACTIONS.SEARCH && item.result);
  const latestSearch = searchObservations.length
    ? searchObservations[searchObservations.length - 1] : null;
  const rawResults = latestSearch ? parseObservationResult(latestSearch) : [];
  const catalogueResults = Array.isArray(rawResults) ? rawResults : [];

  const fit = await assessCatalogueFit(learnerMessage, recentHistory, catalogueResults, llm);

  // v4 is the sole authority for learner-facing catalogue cards. The LLM fit
  // assessor remains useful for deciding whether a catalogue-only reply is
  // sufficient, but its indexes cannot bypass the agreed relevance policy.
  const relevance = evaluateCatalogueRelevance(learnerMessage, catalogueResults);
  const relevantIndexes = getRecommendedCatalogueIndexes(relevance);
  const relevantResults = relevantIndexes.map(index => catalogueResults[index]);
  const approvedFitIndexes = fit.relevantResultIndexes.filter(index =>
    relevantIndexes.includes(index)
  );
  const catalogueSatisfiesRequest =
    fit.catalogueSatisfiesRequest === true &&
    approvedFitIndexes.length > 0 &&
    relevance.missingConcepts.length === 0;

  console.log(
    `[Agent Catalogue Relevance v4] direct=${relevance.direct.length}; ` +
    `strongRelated=${relevance.strongRelated.length}; weakInternal=${relevance.weakRelated.length}; ` +
    `recommended=${relevantResults.length}; missingConcepts=${JSON.stringify(relevance.missingConcepts)}`
  );

  // Catalogue-only replies are appropriate for activity-discovery requests.
  // A teaching request must still receive an explanation and practice questions,
  // even when matching catalogue activities exist.
  const teachingRequest = isTeachingRequest(learnerMessage);

  if (catalogueSatisfiesRequest && !teachingRequest) {
    const response = {
      reply: buildCatalogueOnlyReply(relevantResults),
      action: AGENT_ACTIONS.SEARCH,
      results: relevantResults,
      contentSource: "catalogue",
      showAiWarning: false,
      agent: { steps: plannerSteps, maxSteps: MAX_AGENT_STEPS, completed: true }
    };

    return attachYouTubeVideos(response, learnerMessage, latestSearch);
  }

  // Catalogue had no suitable match or only partially met the request:
  // generate the missing explanation/exercise/etc. with the LLM.
  const smeInstructions = relevantResults.length
    ? await loadInstructionsForCatalogueResults(relevantResults)
    : "";

  const responseContext = `Learner message: ${learnerMessage}

Relevant CSV catalogue results (these may be empty):
${JSON.stringify(relevantResults, null, 2)}

Catalogue fit assessment: ${fit.reason || "The catalogue did not fully satisfy the request."}
Topic coverage: ${relevance.coveredConcepts.join(", ") || "No requested concepts established."}
Missing topic concepts: ${relevance.missingConcepts.join(", ") || "None."}

Fulfil the learner's complete request using your own educational knowledge
where needed. For a request to learn or understand a topic, provide a short
explanation first, then simple examples, then three practice questions unless
the learner specifies a different number or format. Do this even if the
catalogue fit assessment says that catalogue activities satisfy the request.
The application displays the supplied CSV activities separately as activity
cards, so focus this written reply on teaching and do not duplicate the card
list. Never claim that a CSV activity contains a quiz, question count or
explanation unless the CSV data proves that. Follow the learner's requested
grade, number of questions and format exactly.`;

  const reply = await llm.generateText({
    messages: [
      {
        role: "system",
        content: smeInstructions
          ? `${AGENT_SYSTEM_PROMPT}\n\n${smeInstructions}`
          : AGENT_SYSTEM_PROMPT
      },
      ...recentHistory,
      { role: "user", content: responseContext }
    ],
    temperature: 0.4,
    maxTokens: 900
  });

  const response = {
    reply,
    action: latestSearch ? AGENT_ACTIONS.SEARCH : finalAction,
    results: relevantResults,
    contentSource: relevantResults.length ? "mixed" : "llm",
    showAiWarning: true,
    agent: { steps: plannerSteps, maxSteps: MAX_AGENT_STEPS, completed: true }
  };

  return attachYouTubeVideos(response, learnerMessage, latestSearch);
}


// Convert provider exhaustion into a normal learner-facing response instead of
// allowing a provider exception to become an unhandled request failure.
export async function runLearningAgent(args) {
  try {
    return await runLearningAgentInternal(args);
  } catch (error) {
    if (!(error instanceof AgentLlmUnavailableError)) throw error;

    console.warn("[Agent LLM] Request could not continue:", {
      failureType: error.failureType,
      accountLimit: error.accountLimit,
      attempts: error.attempts,
      attemptedModels: error.attemptedModels
    });

    return {
      reply: error.message,
      action: AGENT_ACTIONS.ANSWER,
      results: [],
      videos: [],
      contentSource: "unavailable",
      showAiWarning: true,
      agent: { steps: 0, maxSteps: MAX_AGENT_STEPS, completed: false },
      warning: {
        code: error.code,
        source: error.source,
        accountLimit: error.accountLimit
      }
    };
  }
}
