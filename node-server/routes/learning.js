
import express from "express";

import {
  searchLearningCatalog,
  getLearningFilters,
  getLearningCatalog
} from "../services/learningCatalog.js";

import {
  handleLearningChat
} from "../services/conversationInterpreter.js";

const router = express.Router();

router.get("/search", (req, res) => {
  try {
    const results = searchLearningCatalog({
      q: req.query.q || "",
      grade: req.query.grade || "",
      topic: req.query.topic || "",
      subtopic: req.query.subtopic || "",
      activityType: req.query.activityType || "",
      limit: req.query.limit || 20
    });

    res.json({
      count: results.length,
      results
    });
  } catch (error) {
    console.error("Learning search error:", error);
    res.status(500).json({
      error: "Unable to search learning catalog"
    });
  }
});

router.get("/filters", (req, res) => {
  try {
    res.json(getLearningFilters());
  } catch (error) {
    console.error("Learning filters error:", error);
    res.status(500).json({
      error: "Unable to load learning filters"
    });
  }
});

router.get("/activity", (req, res) => {
  const name = String(req.query.name || "").trim();

  if (!name) {
    return res.status(400).json({
      error: "Activity name is required"
    });
  }

  try {
    const matches = getLearningCatalog().filter(
      item =>
        item.activityName.toLowerCase() === name.toLowerCase()
    );

    res.json({
      count: matches.length,
      results: matches
    });
  } catch (error) {
    console.error("Learning activity error:", error);
    res.status(500).json({
      error: "Unable to retrieve activity"
    });
  }
});

// New conversational endpoint
router.post("/chat", (req, res) => {
  try {
    const result = handleLearningChat({
      conversationId: req.body?.conversationId,
      message: req.body?.message
    });

    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Learning chat error:", error);
    res.status(500).json({
      error: "Unable to process learning chat"
    });
  }
});

export default router;