import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

router.post('/', async (req, res) => {
  const { prompt, imageUrl } = req.body;

  if (!prompt || !imageUrl) {
    return res.status(400).json({ error: 'Both prompt and imageUrl are required' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'Royale-ImageVision'
      },
      body: JSON.stringify({
        model: 'opengvlab/internvl3-14b:free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'No response';
    res.json({ response: aiResponse });

  } catch (err) {
    console.error('Vision AI Error:', err);
    res.status(500).json({ error: 'Vision AI server error' });
  }
});

export default router;
