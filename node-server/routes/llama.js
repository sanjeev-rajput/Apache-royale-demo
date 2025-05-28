import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const OPENROUTER_API_KEY = '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';

router.post('/', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Royale-Chat',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
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
