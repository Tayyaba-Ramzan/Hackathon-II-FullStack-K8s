/**
 * useChatState Hook
 *
 * Manages chat state including messages, conversation_id, loading, and errors.
 */
'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/components/MessageList';
import { sendMessage, ChatResponse, getConversationHistory } from '@/services/api-client';

interface UseChatStateReturn {
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  sendUserMessage: (message: string, userId: string, token: string) => Promise<void>;
  clearError: () => void;
  retry: () => void;
  loadConversationHistory: (conversationId: string, userId: string, token: string) => Promise<void>;
  startNewConversation: () => void;
}

export function useChatState(): UseChatStateReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);

  const sendUserMessage = useCallback(
    async (message: string, userId: string, token: string) => {
      setIsLoading(true);
      setError(null);
      setLastFailedMessage(message);
      setLastUserId(userId);
      setLastToken(token);

      // Optimistic update: add user message immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const response: ChatResponse = await sendMessage(
          userId,
          {
            message,
            conversation_id: conversationId || undefined
          },
          token
        );

        // Update conversation ID if this is a new conversation
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        // Add assistant response
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          tool_calls: response.tool_calls,
          timestamp: response.timestamp
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setLastFailedMessage(null);
      } catch (err) {
        // Remove optimistic user message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(() => {
    if (lastFailedMessage && lastUserId && lastToken) {
      sendUserMessage(lastFailedMessage, lastUserId, lastToken);
    }
  }, [lastFailedMessage, lastUserId, lastToken, sendUserMessage]);

  const loadConversationHistory = useCallback(
    async (convId: string, userId: string, token: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getConversationHistory(userId, convId, token);

        // Transform API messages to Message format
        const loadedMessages: Message[] = response.messages.map((msg: any) => ({
          id: msg.message_id,
          role: msg.role,
          content: msg.content,
          tool_calls: msg.tool_calls || [],
          timestamp: msg.created_at
        }));

        setMessages(loadedMessages);
        setConversationId(convId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load conversation history';
        setError(errorMessage);
        console.error('Error loading conversation history:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setLastFailedMessage(null);
  }, []);

  return {
    messages,
    conversationId,
    isLoading,
    error,
    sendUserMessage,
    clearError,
    retry,
    loadConversationHistory,
    startNewConversation
  };
}
