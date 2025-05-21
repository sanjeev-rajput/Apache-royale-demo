import express from 'express';
import cors from 'cors';

import bodyParser from 'body-parser';


const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

const OPENROUTER_API_KEY = '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';

app.use(cors());
app.use(bodyParser.json());

// Chat Completion Endpoint
app.post('/api/chat', async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Royale-Chat'
            },
            body: JSON.stringify({
                model: 'nousresearch/deephermes-3-mistral-24b-preview:free',
                messages: [
                    { role: 'user', content: prompt }
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
        console.error('AI Error:', err);
        res.status(500).json({ error: 'AI server error' });
    }
});


// Image + Text Vision Endpoint
app.post('/api/vision', async (req, res) => {
    const { prompt, imageUrl } = req.body;

    if (!prompt || !imageUrl) {
        return res.status(400).json({ error: 'Prompt and imageUrl are required' });
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Royale-ImageVision'
            },
            body: JSON.stringify({
                model: 'opengvlab/internvl3-14b:free',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl }
                            }
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

//-----LLIMA

app.post('/api/Llama', async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Royale-Chat'
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-8b-instruct:free",
                messages: [
                    { role: 'user', content: prompt }
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
        console.error('AI Error:', err);
        res.status(500).json({ error: 'AI server error' });
    }
});




//---------------
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
