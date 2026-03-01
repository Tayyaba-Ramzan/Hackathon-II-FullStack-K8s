/**
 * useConversations Hook
 *
 * Manages conversations list, selection, and fetching.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '@/src/components/ConversationList';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface UseConversationsReturn {
  conversations: Conversation[];
  selectedConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  selectConversation: (conversationId: string) => void;
  startNewConversation: () => void;
  refreshConversations: () => Promise<void>;
}

export function useConversations(
  userId: string | null,
  token: string | null
): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!userId || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/${userId}/conversations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  // Fetch conversations on mount and when userId/token changes
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  const startNewConversation = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  const refreshConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    selectedConversationId,
    isLoading,
    error,
    selectConversation,
    startNewConversation,
    refreshConversations
  };
}
