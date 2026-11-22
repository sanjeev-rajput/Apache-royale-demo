import { searchLearningCatalog, getLearningFilters } from "./learningCatalog.js";
import { searchYouTubeVideos } from "./youtubeService.js";
import { loadInstructionsForCatalogueResults } from "../agent/agentConfigLoader.js";
import {
  evaluateCatalogueRelevance,
  getRecommendedCatalogueIndexes
} from "../agent/catalogueRelevance.js";
import {
  buildDeterministicSearchArgs,
  isLearningRequest,
  isTeachingRequest,
  splitLearningConcepts
} from "../agent/learningRequestParser.js";

function recordKey(item) {
  return [item?.catalogId, item?.source, item?.grade, item?.topic, item?.subtopic, item?.activityName, item?.location]
    .map(value => String(value ?? "").trim().toLowerCase()).join("|");
}

function detectSubject(message) {
  try {
    const subjects = getLearningFilters().subjects || [];
    const source = String(message || "").toLowerCase();
    const match = [...subjects]
      .sort((a, b) => String(b).length - String(a).length)
      .find(subject => {
        const escaped = String(subject).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${escaped}\\b`, "i").test(source);
      });
    if (match) return match;

    if (/\b(math|maths|mathematics)\b/i.test(source)) {
      return subjects.find(value => /math/i.test(value)) || "";
    }
  } catch (error) {
    console.warn("[Learning Resources] Subject detection skipped:", error.message);
  }
  return "";
}


function detectGrade(message, fallback) {
  const match = String(message || "").match(/\b(?:class|grade)\s*(\d{1,2})\b/i);
  if (!match) return fallback || "";
  try {
    const grades = getLearningFilters().grades || [];
    const configured = grades.find(value => {
      const gradeMatch = String(value).match(/\b(?:class|grade)\s*(\d{1,2})\b/i);
      return gradeMatch && gradeMatch[1] === match[1];
    });
    return configured || fallback || "";
  } catch {
    return fallback || "";
  }
}

function buildAssessmentContext(message, searchArgs, results, subject) {
  if (!isTeachingRequest(message)) return null;
  const first = Array.isArray(results) ? results[0] : null;
  const topic = String(searchArgs.q || first?.subtopic || first?.topic || "").trim();
  if (!topic) return null;
  return {
    topic,
    grade: String(searchArgs.grade || first?.grade || "").trim(),
    subject: String(subject || first?.subject || "").trim(),
    language: "English",
    instructionProfileId: String(first?.instructionProfileId || "").trim(),
    learningContext: String(message || "").slice(0, 1000)
  };
}

/** Deterministic CSV retrieval + Catalogue Relevance v4. No LLM calls. */
export function searchLearningResources(message) {
  const searchArgs = buildDeterministicSearchArgs(message);
  const subject = detectSubject(message);
  searchArgs.grade = detectGrade(message, searchArgs.grade);
  if (subject) {
    const subjectPattern = /math/i.test(subject)
      ? /\b(?:math|maths|mathematics)\b/ig
      : new RegExp(String(subject).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    searchArgs.q = searchArgs.q
      .replace(subjectPattern, " ")
      .replace(/\s+(?:in|for|subject|of)\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim() || searchArgs.q;
  }
  const concepts = splitLearningConcepts(searchArgs.q);
  const allResults = [];
  let catalogueAvailable = true;
  let catalogueError = null;

  if (isLearningRequest(message)) {
    try {
      for (const concept of (concepts.length ? concepts : [searchArgs.q])) {
        const found = searchLearningCatalog({
          q: concept,
          ...(searchArgs.grade ? { grade: searchArgs.grade } : {}),
          ...(subject ? { subject } : {}),
          limit: 100
        });
        allResults.push(...found);
      }
    } catch (error) {
      catalogueAvailable = false;
      catalogueError = error.message || "Catalogue search failed.";
      console.error("[Learning Resources] CSV catalogue search failed:", catalogueError);
    }
  }

  const uniqueResults = [...new Map(allResults.map(item => [recordKey(item), item])).values()];
  const relevance = evaluateCatalogueRelevance(searchArgs.q, uniqueResults, {
    grade: searchArgs.grade || undefined
  });
  const indexes = getRecommendedCatalogueIndexes(relevance);
  const results = indexes.map(index => uniqueResults[index]);

  const assessmentContext = buildAssessmentContext(message, searchArgs, results, subject);

  return {
    searchArgs,
    subject,
    catalogueAvailable,
    catalogueError,
    catalogueResults: uniqueResults,
    results,
    relevanceSummary: {
      direct: relevance.direct.length,
      strongRelated: relevance.strongRelated.length,
      recommended: results.length
    },
    assessmentContext
  };
}

/** CSV activity retrieval and relevance decisions; no LLM or YouTube calls. */
export function getLearningCatalogueResources(message) {
  const catalogue = searchLearningResources(message);
  return {
    results: catalogue.results,
    assessmentContext: catalogue.assessmentContext,
    availability: { catalogue: catalogue.catalogueAvailable },
    errors: { catalogue: catalogue.catalogueError },
    relevanceSummary: catalogue.relevanceSummary
  };
}

/** YouTube discovery uses only the learner's text; it does not call the CSV service. */
export async function getLearningVideos(message) {
  const searchArgs = buildDeterministicSearchArgs(message);
  let videos = [];
  let youtubeAvailable = Boolean(process.env.YOUTUBE_API_KEY);

  if (isLearningRequest(message)) {
    try {
      videos = await searchYouTubeVideos({
        topic: searchArgs.q,
        grade: searchArgs.grade || "",
        subject: "",
        limit: 5
      });
    } catch (error) {
      youtubeAvailable = false;
      console.warn("[Learning Resources] YouTube retrieval failed:", error.message);
      videos = [];
    }
  }

  return {
    videos: Array.isArray(videos) ? videos : [],
    availability: { youtube: youtubeAvailable }
  };
}

/** Load SME profile guidance for the LLM without making resources depend on it. */
export async function getLearningExplanationGuidance(message) {
  try {
    const catalogue = searchLearningResources(message);
    return await loadInstructionsForCatalogueResults(catalogue.results);
  } catch (error) {
    console.warn("[Learning Explanation] SME guidance lookup skipped:", error.message);
    return "";
  }
}
