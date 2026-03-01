/**
 * ChatInterface Component
 *
 * Main container for the conversational AI chat interface.
 * Manages chat state and coordinates MessageList and InputBox components.
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
      // Error handling is managed by parent component
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4">
        <h1 className="text-lg sm:text-xl font-semibold">Task Management Assistant</h1>
        <p className="text-xs sm:text-sm text-blue-100 hidden sm:block">
          Manage your tasks through natural conversation
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 sm:px-6 pt-3 sm:pt-4">
          <ErrorMessage
            message={error}
            onRetry={onRetry}
            onDismiss={onDismissError}
          />
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading || isSending} />

      {/* Input */}
      <InputBox
        onSend={handleSend}
        disabled={isLoading || isSending}
        placeholder={
          isSending
            ? 'Sending...'
            : 'Type your message... (e.g., "Add a task to buy groceries")'
        }
      />
    </div>
  );
}
