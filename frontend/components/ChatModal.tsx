/**
 * ChatModal Component
 *
 * Professional modal with purple theme
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ChatInterface from '@/components/ChatInterface';
import { useChatState } from '@/hooks/useChatState';
import { useTaskContext } from '@/lib/contexts/TaskContext';

interface ChatModalProps {
  onClose: () => void;
}

export default function ChatModal({ onClose }: ChatModalProps) {
  const { user } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { fetchTasks } = useTaskContext();

  const {
    messages,
    isLoading,
    error,
    sendUserMessage,
    clearError,
    retry,
    startNewConversation
  } = useChatState();

  // Get authentication
  useEffect(() => {
    if (user) {
      setUserId(user.id.toString());
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, [user]);

  // Start fresh conversation when modal opens
  useEffect(() => {
    startNewConversation();
  }, [startNewConversation]);

  // Handle sending message
  const handleSendMessage = async (message: string) => {
    if (!userId || !token) return;

    await sendUserMessage(message, userId, token);
    // Refresh tasks list to show any tasks created/updated by AI
    await fetchTasks();
  };

  const handleRetry = () => {
    clearError();
    retry();
  };

  const handleDismissError = () => {
    clearError();
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!userId || !token) {
    return null;
  }

  return (
    <>
      {/* Professional Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Professional Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center">
        <div
          className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[800px] flex flex-col overflow-hidden border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Professional Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Task Assistant</h2>
                <p className="text-sm text-gray-600">Manage your tasks with ease</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              onSendMessage={handleSendMessage}
              messages={messages}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
              onDismissError={handleDismissError}
            />
          </div>
        </div>
      </div>
    </>
  );
}
