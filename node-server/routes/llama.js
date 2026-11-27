import express from 'express';
import { generateText } from "../services/llmProvider.js";

const router = express.Router();

// 🧠 In-memory conversation history (for 1 user)
let conversationHistory = [
  { role: 'system', content: 'You are a helpful AI assistant.' }
];

router.post('/', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    // Add new user message to history
    conversationHistory.push({ role: 'user', content: prompt });

    const aiResponse = await generateText({
      messages: conversationHistory,
      temperature: 0.4,
      maxTokens: 700,
      model: process.env.OPENROUTER_CHAT_MODEL || "google/gemma-4-26b-a4b-it:free"
    });
    // Save AI response to history
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    res.json({ response: aiResponse });
  } catch (err) {
    // Remove the unpaired learner message when the provider call fails.
    if (conversationHistory.at(-1)?.role === 'user' && conversationHistory.at(-1)?.content === prompt) conversationHistory.pop();
    console.error('AI Error:', err?.code || err?.message);
    res.status(503).json({ error: 'AI chat is temporarily unavailable. Other learning services remain available.' });
  }
});

export default router;
