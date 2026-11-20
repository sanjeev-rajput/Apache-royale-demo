import express from "express";
import { createAssessment, submitAssessment } from "../agent/assessment-agent/assessmentService.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const result = await createAssessment(req.body?.context);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[Assessment API] Generation failed:", {
      message: error.message,
      failureType: error.failureType || null,
      provider: error.provider || null,
      modelId: error.modelId || null
    });
    return res.status(error.statusCode || 502).json({
      success: false,
      errorCode: "ASSESSMENT_GENERATION_FAILED",
      message: error.statusCode ? error.message : "The assessment could not be generated right now. Please try again."
    });
  }
});

router.post("/submit", (req, res) => {
  try {
    const result = submitAssessment({
      attemptId: req.body?.attemptId,
      answers: req.body?.answers
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      errorCode: error.code || "ASSESSMENT_SUBMISSION_FAILED",
      message: error.message || "The assessment could not be submitted."
    });
  }
});

export default router;
