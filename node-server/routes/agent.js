import express from "express";
import { runLearningAgent } from "../agent/agentEngine.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "A valid message is required."
      });
    }

    const result = await runLearningAgent({
      message: message.trim(),
      history
    });

    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("[Agent API]", error);

    return res.status(500).json({
      success: false,
      error: "The learning agent could not process your request."
    });
  }
});

export default router;