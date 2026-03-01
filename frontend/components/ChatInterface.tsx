/**
 * ChatInterface Component
 *
 * Professional AI chat interface with purple theme
 */
'use client';

import { useState } from 'react';
import MessageList, { Message } from './MessageList';
import InputBox from './InputBox';
import ErrorMessage from './ErrorMessage';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onDismissError?: () => void;
}

export default function ChatInterface({
  onSendMessage,
  messages,
  isLoading = false,
  error = null,
  onRetry,
  onDismissError
}: ChatInterfaceProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (message: string) => {
    setIsSending(true);
    try {
      await onSendMessage(message);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Professional Header with Active Status */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {/* Instagram-style active status - parrot green */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#44d62c] rounded-full border-2 border-purple-600 shadow-sm"></div>
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI Task Assistant</h1>
            <p className="text-sm text-purple-100">Online • Ready to help</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 pt-4">
          <ErrorMessage
            message={error}
            onRetry={onRetry}
            onDismiss={onDismissError}
          />
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading || isSending} onSendMessage={handleSend} />

      {/* Input */}
      <InputBox
        onSend={handleSend}
        disabled={isLoading || isSending}
        placeholder="Message AI Assistant..."
      />
    </div>
  );
}
