/**
 * MessageList Component
 *
 * Displays conversation messages chronologically with user/assistant differentiation.
 * Auto-scrolls to bottom on new messages with enhanced formatting.
 */
'use client';

import { useEffect, useRef } from 'react';
import TypingIndicator from './TypingIndicator';

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  result: string;
  task_id?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatMessageContent = (content: string) => {
    // Split by newlines and format
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Check for bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <li key={idx} className="ml-4">
            {line.trim().substring(1).trim()}
          </li>
        );
      }
      // Check for numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <li key={idx} className="ml-4">
            {line.trim().replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      // Regular line
      return line ? <p key={idx}>{line}</p> : <br key={idx} />;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Conversation messages">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-gray-500" role="status">
          <div className="text-center max-w-md">
            <p className="text-lg font-medium mb-2">Welcome to your AI Task Assistant!</p>
            <p className="text-sm mb-4">
              Start a conversation by typing a message below.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 text-left text-sm space-y-2">
              <p className="font-medium text-gray-700">Try these examples:</p>
              <ul className="space-y-1 text-gray-600" role="list">
                <li>• "Add a task to buy groceries"</li>
                <li>• "Show me my tasks"</li>
                <li>• "Mark the groceries task as complete"</li>
                <li>• "Delete the task about laundry"</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          role="article"
          aria-label={`${message.role === 'user' ? 'Your' : 'Assistant'} message`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            <div className="space-y-1">
              {formatMessageContent(message.content)}
            </div>

            {/* Display tool calls if present */}
            {message.tool_calls && message.tool_calls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300" role="region" aria-label="Actions performed">
                <p className="text-xs font-semibold mb-2 text-gray-600">Actions performed:</p>
                <div className="space-y-1" role="list">
                  {message.tool_calls.map((toolCall, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 text-xs p-2 rounded ${
                        toolCall.result === 'success'
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                      role="listitem"
                      aria-label={`${toolCall.result === 'success' ? 'Successful' : 'Failed'} action: ${formatToolCall(toolCall)}`}
                    >
                      <span className="flex-shrink-0 font-bold" aria-hidden="true">
                        {toolCall.result === 'success' ? '✓' : '✗'}
                      </span>
                      <span className="flex-1">{formatToolCall(toolCall)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
              <time dateTime={message.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </time>
            </p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start" role="status" aria-live="polite" aria-label="AI is thinking">
          <TypingIndicator />
        </div>
      )}

      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}

function formatToolCall(toolCall: ToolCall): string {
  switch (toolCall.tool) {
    case 'add_task':
      return `Added task: ${toolCall.parameters.title}`;
    case 'list_tasks':
      return 'Listed tasks';
    case 'complete_task':
      return 'Completed task';
    case 'delete_task':
      return 'Deleted task';
    case 'update_task':
      return 'Updated task';
    default:
      return toolCall.tool;
  }
}
