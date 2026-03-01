/**
 * useChatState Hook
 *
 * Manages chat state including messages, loading, and errors.
 * Simplified version without conversation history.
 */
'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/components/MessageList';
import { sendMessage, ChatResponse } from '@/services/api-client';

interface UseChatStateReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendUserMessage: (message: string, userId: string, token: string) => Promise<void>;
  clearError: () => void;
  retry: () => void;
  startNewConversation: () => void;
}

export function useChatState(): UseChatStateReturn {
  const [messages, setMessages] = useState<Message[]>([]);
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
            conversation_id: undefined // Always start fresh, no conversation history
          },
          token
        );

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
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(() => {
    if (lastFailedMessage && lastUserId && lastToken) {
      sendUserMessage(lastFailedMessage, lastUserId, lastToken);
    }
  }, [lastFailedMessage, lastUserId, lastToken, sendUserMessage]);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastFailedMessage(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendUserMessage,
    clearError,
    retry,
    startNewConversation
  };
}
