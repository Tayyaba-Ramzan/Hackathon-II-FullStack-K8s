/**
 * InputBox Component
 *
 * Professional input field with purple theme
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
  placeholder = "Message AI Assistant..."
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
  const canSend = message.trim() && !disabled;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <div className="flex gap-3 items-center">
        {/* Professional Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-2.5 text-sm leading-5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            maxLength={MAX_LENGTH}
            style={{ height: '44px', maxHeight: '120px' }}
          />

          {/* Character Counter */}
          {isNearLimit && (
            <div className="absolute bottom-2 right-2">
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                {MAX_LENGTH - characterCount}
              </span>
            </div>
          )}
        </div>

        {/* Professional SaaS-Level Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`mb-2 flex-shrink-0 h-11 w-11 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
            canSend
              ? 'bg-gradient-to-br from-purple-600 via-purple-600 to-violet-700 hover:from-purple-700 hover:via-purple-700 hover:to-violet-800 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
          }`}
          aria-label="Send message"
        >
          <svg className="w-5 h-5 transform rotate-45" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
