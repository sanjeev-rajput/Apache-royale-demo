/*import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

router.post('/', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        //'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Royale-Chat',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const aiResponse = data.choices?.[0]?.message?.content || 'No response';
    res.json({ response: aiResponse });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: 'AI server error' });
  }
});

export default router;
*/

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'Royale-Chat',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: conversationHistory,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const aiResponse = data.choices?.[0]?.message?.content || 'No response';

    // Save AI response to history
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    res.json({ response: aiResponse });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: 'AI server error' });
  }
});

export default router;
