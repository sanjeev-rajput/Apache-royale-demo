import express from 'express';
import { randomUUID } from 'crypto';
import {
  processMultilingualMessage,
  createMultilingualConversation,
  getMultilingualConversation,
  clearMultilingualConversation
} from '../services/multilingualEngine.js';


const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { conversationId, message, language } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required.'
      });
    }

    const id = conversationId || randomUUID();

    const result = await processMultilingualMessage({
      conversationId: id,
      message: message.trim(),
      language: language || 'Hinglish'
    });

    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Multilingual Tutor error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to generate a response at this time.'
    });
  }
});

// Create a new independent conversation.
router.post('/conversation', (req, res) => {
  try {
    const conversationId = randomUUID();
    const conversation = createMultilingualConversation(conversationId);

    return res.json({
      success: true,
      ...conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to create conversation.'
    });
  }
});

// Retrieve an existing conversation and its message history.
router.get('/conversation/:id', (req, res) => {
  const conversationId = req.params.id;
  const conversation = getMultilingualConversation(conversationId);

  if (conversation == null) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found.'
    });
  }

  return res.json({
    success: true,
    ...conversation
  });
});

// Delete a conversation and its message history.
router.delete('/conversation/:id', (req, res) => {
  const conversationId = req.params.id;
  const deleted = clearMultilingualConversation(conversationId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found.'
    });
  }

  return res.json({
    success: true,
    message: 'Conversation cleared successfully.',
    conversationId
  });
});

export default router;