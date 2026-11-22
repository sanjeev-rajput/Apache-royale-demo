import express from "express";
import { runLearningAgent } from "../agent/agentEngine.js";
import { getLearningCatalogueResources, getLearningVideos } from "../services/learningResourceService.js";
import { getAgentLlmStatus, setAgentLlmStatus } from "../agent/agentLlmStatus.js";

const router = express.Router();

router.get("/status/:requestId", (req, res) => {
  const status = getAgentLlmStatus(req.params.requestId);
  if (!status) return res.json({ success: true, state: "waiting", message: "Your learning explanation is being generated." });
  return res.json({ success: true, ...status });
});

// LLM-only endpoint: no catalogue planner, no catalogue-fit LLM call, no YouTube call.
router.post("/", async (req, res) => {
  const { message, history = [], requestId } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, errorCode: "INVALID_LEARNER_MESSAGE", message: "A valid message is required." });
  }

  if (requestId) setAgentLlmStatus(requestId, { state: "processing", message: "Generating your learning explanation..." });
  try {
    const result = await runLearningAgent({
      message: message.trim(),
      history,
      onLlmStatus: status => setAgentLlmStatus(requestId, status)
    });
    if (requestId) {
      setAgentLlmStatus(requestId, result.llmAvailable
        ? { state: "completed", message: "Your explanation is ready." }
        : { state: "unavailable", message: "The AI explanation service is unavailable." });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[Agent API] Explanation application error:", error);
    if (requestId) setAgentLlmStatus(requestId, { state: "failed", message: "The learning explanation could not be prepared." });
    return res.status(500).json({
      success: false,
      errorCode: "AGENT_APPLICATION_ERROR",
      message: "The learning explanation could not be prepared. Please try again."
    });
  }
});

// Deterministic CSV endpoint: catalogue retrieval + Relevance v4, with no LLM dependency.
router.post("/resources", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) {
    return res.status(400).json({ success: false, errorCode: "INVALID_LEARNER_MESSAGE", message: "A valid learner message is required." });
  }

  try {
    const resources = getLearningCatalogueResources(message);
    return res.status(200).json({ success: true, ...resources });
  } catch (error) {
    console.error("[Agent Resources API] Resource retrieval error:", error);
    // Resource failure is isolated from the explanation endpoint.
    return res.status(200).json({
      success: true,
      results: [],
      assessmentContext: null,
      availability: { catalogue: false },
      errors: { catalogue: "The learning catalogue is temporarily unavailable." }
    });
  }
});

// Independent YouTube lookup: no CSV, planner, or LLM dependency.
router.post("/videos", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) {
    return res.status(400).json({ success: false, errorCode: "INVALID_LEARNER_MESSAGE", message: "A valid learner message is required." });
  }

  try {
    const videos = await getLearningVideos(message);
    return res.status(200).json({ success: true, ...videos });
  } catch (error) {
    console.error("[Agent Videos API] YouTube retrieval error:", error);
    return res.status(200).json({
      success: true,
      videos: [],
      availability: { youtube: false }
    });
  }
});

export default router;
