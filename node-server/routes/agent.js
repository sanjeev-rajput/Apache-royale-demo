import express from "express";
import { runLearningAgent } from "../agent/agentEngine.js";
import { AgentLlmUnavailableError } from "../agent/agentLlmResilience.js";
import { getAgentLlmStatus, setAgentLlmStatus } from "../agent/agentLlmStatus.js";

const router = express.Router();

const PROVIDER_UNAVAILABLE_MESSAGE =
  "We tried multiple currently available free AI models, but none returned a usable response. The external AI service may be temporarily unavailable or rate-limited. Your learning request was not completed. Please try again shortly.";

router.get("/status/:requestId", (req, res) => {
  const status = getAgentLlmStatus(req.params.requestId);
  if (!status) return res.json({ success: true, state: "waiting", message: "Your learning request is being processed." });
  return res.json({ success: true, ...status });
});

router.post("/", async (req, res) => {
  const { message, history = [], requestId } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, errorCode: "INVALID_LEARNER_MESSAGE", message: "A valid message is required." });
  }

  if (requestId) {
    setAgentLlmStatus(requestId, { state: "processing", message: "Thinking..." });
  }

  try {
    const result = await runLearningAgent({
      message: message.trim(),
      history,
      onLlmStatus: status => setAgentLlmStatus(requestId, status)
    });

    if (requestId) setAgentLlmStatus(requestId, { state: "completed", message: "Your response is ready." });
    return res.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof AgentLlmUnavailableError || error?.code === "AGENT_LLM_UNAVAILABLE") {
      console.error("[Agent API] All eligible free LLM attempts failed:", {
        operation: error.operation,
        attempts: error.attempts,
        attemptedModels: error.attemptedModels,
        cause: error.cause?.message || error.message
      });
      if (requestId) setAgentLlmStatus(requestId, { state: "failed", message: PROVIDER_UNAVAILABLE_MESSAGE });
      return res.status(200).json({
        success: false,
        errorCode: "AGENT_LLM_UNAVAILABLE",
        errorSource: "external_llm_provider",
        retryAttempts: error.attempts || 0,
        message: PROVIDER_UNAVAILABLE_MESSAGE
      });
    }

    console.error("[Agent API] Application error:", error);
    if (requestId) setAgentLlmStatus(requestId, { state: "failed", message: "Agentic Learning encountered an application error. Please try again." });
    return res.status(500).json({
      success: false,
      errorCode: "AGENT_APPLICATION_ERROR",
      errorSource: "agent_application",
      message: "Agentic Learning encountered an application error. Please try again."
    });
  }
});

export default router;
