/**
 * API Client Service
 *
 * Handles communication with the backend chat API.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

// TypeScript Types
export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  result: string;
  task_id?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  conversation_id: string;
  response: string;
  tool_calls: ToolCall[];
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}

/**
 * Send a message to the chat API.
 *
 * @param userId - User identifier
 * @param request - Chat request with message and optional conversation_id
 * @param token - JWT authentication token
 * @returns Chat response from API
 * @throws Error if request fails
 */
export async function sendMessage(
  userId: string,
  request: ChatRequest,
  token: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'Unknown Error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }));

    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data: ChatResponse = await response.json();
  return data;
}

/**
 * Get conversation history (placeholder for future implementation).
 *
 * @param userId - User identifier
 * @param conversationId - Conversation identifier
 * @param token - JWT authentication token
 * @returns Conversation messages
 */
export async function getConversationHistory(
  userId: string,
  conversationId: string,
  token: string
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/${userId}/conversations/${conversationId}/messages`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation history: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List user's conversations (placeholder for future implementation).
 *
 * @param userId - User identifier
 * @param token - JWT authentication token
 * @returns List of conversations
 */
export async function listConversations(
  userId: string,
  token: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/conversations`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`);
  }

  return response.json();
}
