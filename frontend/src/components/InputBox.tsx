/**
 * InputBox Component
 *
 * Text input for user messages with send button and keyboard handling.
 */
'use client';

import { useState, KeyboardEvent, ChangeEvent } from 'react';

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_LENGTH = 5000;

export default function InputBox({
  onSend,
  disabled = false,
  placeholder = "Type your message..."
}: InputBoxProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setMessage(e.target.value);
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > MAX_LENGTH * 0.9;

  return (
    <div className="border-t border-gray-300 bg-white p-4" role="region" aria-label="Message input area">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={3}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label="Message input"
            aria-describedby="input-help character-count"
            aria-invalid={characterCount > MAX_LENGTH}
            maxLength={MAX_LENGTH}
          />
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            aria-label="Send message"
            aria-disabled={disabled || !message.trim()}
          >
            Send
          </button>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span id="input-help" className="text-xs">
            Press Enter to send, Shift+Enter for new line
          </span>
          <span
            id="character-count"
            className={isNearLimit ? 'text-orange-600 font-medium' : ''}
            aria-live="polite"
            aria-atomic="true"
          >
            {characterCount} / {MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
