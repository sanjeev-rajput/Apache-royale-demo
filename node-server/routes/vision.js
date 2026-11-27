import express from 'express';
import { requestOpenRouterChatCompletion } from "../services/openRouterRequestManager.js";
import { getLlmConfig } from "../services/llmProvider.js";
import { getSelectedFreeModel, markFreeModelUnavailable, isCapabilityCompatibilityError } from "../services/openRouterModelManager.js";

const router = express.Router();

router.post('/', async (req, res) => {
  const { prompt, imageUrl } = req.body;

  if (!prompt || !imageUrl) {
    return res.status(400).json({ error: 'Both prompt and imageUrl are required' });
  }

  try {
    // This legacy image endpoint currently uses OpenRouter's image_url format.
    // Do not leak OpenRouter calls into LOCAL/Ollama development.
    if (getLlmConfig().provider !== "openrouter") {
      return res.status(503).json({ error: "Image analysis is unavailable in the current local model configuration. Other learning services remain available." });
    }
    const selected = await getSelectedFreeModel({ requireImage: true });
    let result;
    try {
      result = await requestOpenRouterChatCompletion({
        body: {
          model: selected.id,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }]
        },
        title: "Royale-ImageVision"
      });
    } catch (error) {
      if (Number(error?.status) === 404) {
        markFreeModelUnavailable(selected.id, "Vision HTTP 404", { global: true });
      } else if (isCapabilityCompatibilityError(error, "image")) {
        markFreeModelUnavailable(selected.id, "Vision HTTP 422 image capability incompatibility", { capability: "image" });
      }
      throw error;
    }
    const aiResponse = result.content;
    res.json({ response: aiResponse });

  } catch (err) {
    console.error('Vision AI Error:', err);
    res.status(err?.retryable === false || err?.code?.startsWith('OPENROUTER_') ? 503 : 500).json({ error: 'Vision analysis is temporarily unavailable. Other learning services remain available.' });
  }
});

export default router;
