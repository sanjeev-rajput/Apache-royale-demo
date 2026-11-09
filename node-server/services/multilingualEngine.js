import { generateText } from './llmProvider.js';
import { buildMultilingualSystemPrompt } from './multilingualPrompt.js';

// Independent in-memory conversation storage.
// Each conversationId has its own message history.
const conversations = new Map();

const MAX_HISTORY_MESSAGES = 20;

export async function processMultilingualMessage({
  conversationId,
  message,
  language
}) {
  const id = conversationId;
  const selectedLanguage = language || 'Hinglish';

  const previousMessages = conversations.get(id) || [];

  const newMessages = [
    ...previousMessages,
    {
      role: 'user',
      content: message
    }
  ];

  // Keep only the most recent messages to limit context size.
  const history = newMessages.slice(-MAX_HISTORY_MESSAGES);

  const messages = [
    {
      role: 'system',
      content: buildMultilingualSystemPrompt(selectedLanguage)
    },
    ...history
  ];

  const reply = await generateText({
    messages,
    temperature: 0.5,
    maxTokens: 700
  });

  // Save history only after a successful AI response.
  conversations.set(id, [
    ...history,
    {
      role: 'assistant',
      content: reply
    }
  ].slice(-MAX_HISTORY_MESSAGES));

  return {
    conversationId: id,
    reply,
    language: selectedLanguage
  };
}
// Create an empty conversation.
export function createMultilingualConversation(conversationId) {
  conversations.set(conversationId, []);

  return {
    conversationId,
    messages: []
  };
}

// Retrieve an existing conversation.
export function getMultilingualConversation(conversationId) {
  if (!conversations.has(conversationId)) {
    return null;
  }

  return {
    conversationId,
    messages: [...conversations.get(conversationId)]
  };
}

// Delete a conversation and its message history.
export function clearMultilingualConversation(conversationId) {
  return conversations.delete(conversationId);
}