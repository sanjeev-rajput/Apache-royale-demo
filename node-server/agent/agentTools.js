import {
  searchLearningCatalog,
  getLearningFilters
} from "../services/learningCatalog.js";

export const agentTools = [
  {
    type: "function",
    function: {
      name: "searchLearningContent",
      description: "Search the existing SME-maintained CSV learning catalogue for relevant learning activities.",
      parameters: {
        type: "object",
        properties: {
          q: { type: "string", description: "Core learning concept or keyword, not the full instruction" },
          grade: { type: "string" },
          subject: { type: "string" },
          topic: { type: "string" },
          subtopic: { type: "string" },
          activityType: { type: "string" },
          limit: { type: "integer" }
        },
        required: ["q"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getLearningFilters",
      description: "Get available grades, subjects, topics and activity types from the existing learning catalogue.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }
  }
];

export async function executeAgentTool(name, args = {}) {
  switch (name) {
    case "searchLearningContent": {
      // Omit null/undefined/blank optional values so the catalogue's own
      // defaults are applied. Do not change the shared catalogue service.
      const cleanArgs = Object.fromEntries(
        Object.entries(args || {}).filter(([key, value]) =>
          key === "q"
            ? value !== null && value !== undefined && String(value).trim() !== ""
            : value !== null && value !== undefined &&
              !(typeof value === "string" && value.trim() === "")
        )
      );

      if (!cleanArgs.q && cleanArgs.topic) {
        cleanArgs.q = cleanArgs.topic;
        delete cleanArgs.topic;
      }

      return searchLearningCatalog(cleanArgs);
    }

    case "getLearningFilters":
      return getLearningFilters();

    default:
      throw new Error(`Unknown agent tool: ${name}`);
  }
}
