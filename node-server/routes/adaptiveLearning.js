import express from "express";
import { createAdaptiveSession, performAdaptiveAction, endAdaptiveSession } from "../services/adaptiveLearningService.js";

const router = express.Router();

router.post("/sessions", async (req, res) => {
  try {
    return res.status(200).json({ success: true, ...(await createAdaptiveSession(req.body || {})) });
  } catch (error) {
    console.error("[Adaptive Learning] Session creation failed:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.code || "ADAPTIVE_SESSION_CREATE_FAILED",
      message: error.statusCode ? error.message : "The learning session could not be started. Please try again."
    });
  }
});

router.delete("/sessions/:sessionId", (req, res) => {
  try {
    return res.status(200).json({ success: true, ...endAdaptiveSession(req.params.sessionId) });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.code || "ADAPTIVE_SESSION_END_FAILED",
      message: error.message || "The learning session could not be ended."
    });
  }
});

router.post("/sessions/:sessionId/actions", async (req, res) => {
  try {
    const result = await performAdaptiveAction(req.params.sessionId, req.body?.action, req.body?.input || {});
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[Adaptive Learning] Action failed:", error.message);
    const expectedActionError = error.statusCode && error.statusCode < 500;
    return res.status(expectedActionError ? 200 : (error.statusCode || 500)).json({
      success: false,
      errorCode: error.code || "ADAPTIVE_ACTION_FAILED",
      message: error.message || "That learning action could not be completed. Please try another step."
    });
  }
});

export default router;
