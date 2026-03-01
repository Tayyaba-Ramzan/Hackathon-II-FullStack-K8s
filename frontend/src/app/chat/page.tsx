/**
 * Chat Page
 *
 * Main page for the conversational task management interface with conversation history.
 */
'use client';

import { useEffect, useState } from 'react';
import ChatInterface from '@/src/components/ChatInterface';
import ConversationList from '@/src/components/ConversationList';
import { useChatState } from '@/src/hooks/useChatState';
import { useConversations } from '@/src/hooks/useConversations';

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    messages,
    conversationId,
    isLoading,
    error,
    sendUserMessage,
    clearError,
    retry,
    loadConversationHistory,
    startNewConversation: clearChat
  } = useChatState();

  const {
    conversations,
    selectedConversationId,
    isLoading: conversationsLoading,
    selectConversation,
    startNewConversation,
    refreshConversations
  } = useConversations(userId, token);

  // Get authentication from localStorage or session
  useEffect(() => {
    // TODO: Replace with actual Better Auth integration
    const storedUserId = localStorage.getItem('user_id');
    const storedToken = localStorage.getItem('auth_token');

    if (storedUserId && storedToken) {
      setUserId(storedUserId);
      setToken(storedToken);
    } else {
      setAuthError('Please sign in to use the chat');
    }
  }, []);

  // Handle conversation selection
  const handleSelectConversation = async (convId: string) => {
    if (!userId || !token) return;

    selectConversation(convId);
    await loadConversationHistory(convId, userId, token);
  };

  // Handle new conversation
  const handleNewConversation = () => {
    startNewConversation();
    clearChat();
  };

  // Handle sending message
  const handleSendMessage = async (message: string) => {
    if (!userId || !token) {
      setAuthError('Authentication required');
      return;
    }

    await sendUserMessage(message, userId, token);
    // Refresh conversations list after sending message
    await refreshConversations();
  };

  const handleRetry = () => {
    clearError();
    retry();
  };

  const handleDismissError = () => {
    clearError();
  };

  // Show authentication error if not authenticated
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <button
            onClick={() => (window.location.href = '/auth/signin')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversation List Sidebar */}
      <ConversationList
        conversations={conversations}
        activeConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        isLoading={conversationsLoading}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <div className="flex-1 p-4">
          <ChatInterface
            onSendMessage={handleSendMessage}
            messages={messages}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            onDismissError={handleDismissError}
          />
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 py-2 px-4 text-center text-sm text-gray-500">
          {conversationId && (
            <span className="text-xs">
              Conversation ID: {conversationId.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
