import {
  generateText,
  generateStructuredResponse
} from "../services/llmProvider.js";

import { executeAgentTool } from "./agentTools.js";
import { AGENT_ACTIONS, PLANNER_PROMPT } from "./agentPlanner.js";
import { loadInstructionsForCatalogueResults } from "./agentConfigLoader.js";

const MAX_AGENT_STEPS = 4;
const MAX_HISTORY_MESSAGES = 8;
const MAX_OBSERVATION_CHARS = 16000;

const AGENT_SYSTEM_PROMPT = `
You are Agentic Learning, a friendly, age-appropriate K-12 learning companion.

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
  const serialized = JSON.stringify(value);
  return serialized.length > MAX_OBSERVATION_CHARS
    ? `${serialized.slice(0, MAX_OBSERVATION_CHARS)}...[truncated]`
    : serialized;
}

function buildPlannerPayload(message, history, observations, step) {
  return {
    learnerMessage: message,
    conversationHistory: history,
    step,
    maximumSteps: MAX_AGENT_STEPS,
    toolObservations: observations
  };
}

function parseObservationResult(observation) {
  if (!observation || typeof observation.result !== "string") return null;
  try {
    return JSON.parse(observation.result);
  } catch {
    return null;
  }
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

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findDeterministicallyRelevantIndexes(searchArguments, results) {
  if (!Array.isArray(results) || results.length === 0) return [];

  const query = normalizeSearchText(searchArguments?.q || searchArguments?.topic);
  if (!query) return [];

  // Exact concept matches in structured catalogue fields take priority over
  // an LLM relevance judgement. This prevents a valid CSV activity from
  // disappearing merely because the assessment model returns no indexes.
  const searchableFields = [
    "topic",
    "subtopic",
    "activityName",
    "keywords",
    "description"
  ];

  const indexes = [];
  results.forEach((item, index) => {
    const fields = searchableFields.map(field => normalizeSearchText(item?.[field]));
    if (fields.some(value => value && (` ${value} `).includes(` ${query} `))) {
      indexes.push(index);
    }
  });

  return indexes;
}

async function assessCatalogueFit(message, history, results, searchArguments = {}) {
  if (!Array.isArray(results) || results.length === 0) {
    return { catalogueSatisfiesRequest: false, relevantResultIndexes: [], reason: "No catalogue results." };
  }

  const deterministicIndexes = findDeterministicallyRelevantIndexes(searchArguments, results);

  let assessment;
  try {
    assessment = await generateStructuredResponse({
      systemPrompt: CATALOGUE_FIT_PROMPT,
      userPayload: { learnerMessage: message, conversationHistory: history, catalogueResults: results },
      temperature: 0,
      maxTokens: 300
    });
  } catch (error) {
    console.warn("[Agent Catalogue Fit] Assessment failed; retaining deterministic catalogue matches:", error.message);
    return {
      catalogueSatisfiesRequest: false,
      relevantResultIndexes: deterministicIndexes,
      reason: "Catalogue relevance was established from exact catalogue-field matches; fulfilment could not be verified."
    };
  }

  const assessedIndexes = Array.isArray(assessment?.relevantResultIndexes)
    ? assessment.relevantResultIndexes.filter(index =>
        Number.isInteger(index) && index >= 0 && index < results.length)
    : [];

  // Exact matches to the planner's search concept are authoritative for
  // relevance. The LLM assessment is still used to decide completeness.
  // Semantic assessment indexes are a fallback when no exact match exists.
  const relevantIndexes = deterministicIndexes.length
    ? deterministicIndexes
    : assessedIndexes;

  return {
    catalogueSatisfiesRequest: assessment?.catalogueSatisfiesRequest === true && relevantIndexes.length > 0,
    relevantResultIndexes: relevantIndexes,
    reason: typeof assessment?.reason === "string" ? assessment.reason : ""
  };
}

export async function runLearningAgent({ message, history = [] }) {
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
    const rawPlan = await generateStructuredResponse({
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
      observations.push({ step, action: plan.action, arguments: plan.arguments,
        result: compactObservation(result) });
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

  const fit = await assessCatalogueFit(
    learnerMessage,
    recentHistory,
    catalogueResults,
    latestSearch?.arguments || {}
  );
  const relevantResults = fit.relevantResultIndexes.map(index => catalogueResults[index]);

  // If the catalogue completely fulfils the request, no user-facing LLM prose
  // is needed. This keeps the result genuinely catalogue-sourced and warning-free.
  if (fit.catalogueSatisfiesRequest) {
    return {
      reply: buildCatalogueOnlyReply(relevantResults),
      action: AGENT_ACTIONS.SEARCH,
      results: relevantResults,
      contentSource: "catalogue",
      showAiWarning: false,
      agent: { steps: plannerSteps, maxSteps: MAX_AGENT_STEPS, completed: true }
    };
  }

  // Catalogue had no suitable match or only partially met the request:
  // generate the missing explanation/exercise/etc. with the LLM.
  const responseContext = `Learner message: ${learnerMessage}

Relevant CSV catalogue results (these may be empty):
${JSON.stringify(relevantResults, null, 2)}

Catalogue fit assessment: ${fit.reason || "The catalogue did not fully satisfy the request."}

Fulfil the learner's complete request using your own educational knowledge
where needed. If relevant catalogue activities are supplied, mention them as
additional resources, but never claim they contain a requested quiz, question
count or explanation unless the CSV data proves that. Follow the learner's
requested grade, number of questions and format exactly.`;

  const smeInstructions = await loadInstructionsForCatalogueResults(relevantResults);
  const systemPrompt = smeInstructions
    ? `${AGENT_SYSTEM_PROMPT}\n\n${smeInstructions}`
    : AGENT_SYSTEM_PROMPT;

  const reply = await generateText({
    messages: [
      { role: "system", content: systemPrompt },
      ...recentHistory,
      { role: "user", content: responseContext }
    ],
    temperature: 0.4,
    maxTokens: 900
  });

  return {
    reply,
    action: latestSearch ? AGENT_ACTIONS.SEARCH : finalAction,
    results: relevantResults,
    contentSource: relevantResults.length ? "mixed" : "llm",
    showAiWarning: true,
    agent: { steps: plannerSteps, maxSteps: MAX_AGENT_STEPS, completed: true }
  };
}
