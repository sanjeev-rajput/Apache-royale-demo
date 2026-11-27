// Backward-compatible re-export. Discovery and selection are owned centrally
// by services/openRouterModelManager.js, not by the Agentic feature.
export {
  getAvailableFreeModels,
  clearOpenRouterModelCacheForTests as clearAgentModelCacheForTests
} from "../services/openRouterModelManager.js";
