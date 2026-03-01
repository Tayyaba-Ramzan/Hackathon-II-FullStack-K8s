/**
 * MessageList Component
 *
 * Professional message display with purple theme
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
  onSendMessage?: (message: string) => void;
}

export default function MessageList({ messages, isLoading, onSendMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <li key={idx} className="ml-4">
            {line.trim().substring(1).trim()}
          </li>
        );
      }
      if (/^\d+\./.test(line.trim())) {
        return (
          <li key={idx} className="ml-4">
            {line.trim().replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      return line ? <p key={idx}>{line}</p> : <br key={idx} />;
    });
  };

  const examplePrompts = [
    "Add a task to buy groceries",
    "Show me my tasks",
    "Mark the first task as complete"
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 to-purple-50/30">
      {/* Welcome Section - Only show when no messages */}
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center min-h-full py-12">
          <div className="text-center max-w-lg px-4">
            {/* Premium Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Welcome Text */}
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Welcome to AI Task Assistant</h2>
            <p className="text-base mb-8 text-gray-600 leading-relaxed">
              Start managing your tasks with natural conversation
            </p>

            {/* Premium Example Cards */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-4">Try these examples:</p>
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage?.(prompt)}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {prompt}
                  </span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages - Only show when there are messages */}
      {messages.length > 0 && messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* Avatar */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-purple-500 to-violet-600'
              : 'bg-gradient-to-br from-purple-600 to-violet-700'
          }`}>
            {message.role === 'user' ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>

          {/* Message Bubble */}
          <div className="flex-1 max-w-[75%]">
            <div
              className={`rounded-2xl px-5 py-4 shadow-md ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <div className="text-sm leading-relaxed space-y-1">
                {formatMessageContent(message.content)}
              </div>

              {/* Tool Calls */}
              {message.tool_calls && message.tool_calls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <p className="text-xs font-bold mb-3 text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Actions Performed
                  </p>
                  <div className="space-y-2">
                    {message.tool_calls.map((toolCall, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs p-3 rounded-lg ${
                          toolCall.result === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                          toolCall.result === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {toolCall.result === 'success' ? '✓' : '✗'}
                        </span>
                        <span className="font-medium">{formatToolCall(toolCall)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <p className={`text-xs mt-3 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}

      <div ref={messagesEndRef} />
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
