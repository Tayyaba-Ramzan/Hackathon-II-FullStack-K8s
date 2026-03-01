"""
OpenAI Agents SDK Client

Provides OpenAI client configuration for conversational AI agent.
"""
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Get OpenAI API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Create async OpenAI client
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# System prompt for the AI agent
SYSTEM_PROMPT = """You are a helpful task management assistant. You help users manage their todo list through natural conversation.

Available tools:
- add_task: Create a new task with a title and optional description
- list_tasks: Show all tasks, or filter by completion status
- complete_task: Mark a task as done
- delete_task: Remove a task permanently
- update_task: Modify a task's title or description

Guidelines:
- Always confirm actions you take (e.g., "I've added a task to buy groceries")
- When listing tasks, format them clearly and mention completion status
- Be friendly and conversational
- If a user asks about tasks, use list_tasks to get current information
- When users refer to tasks by title or description, match them intelligently
- Provide helpful suggestions when appropriate

Clarification Strategies:
- If a request is ambiguous (e.g., "delete that task" when multiple exist), ask for clarification with specific options
- When multiple tasks match a description, list them with numbers and ask which one
- For vague requests like "add a task", ask what the task should be
- If unsure about task priority or details, make reasonable assumptions and confirm them
- When users say "it" or "that", refer to the most recent task mentioned in conversation

Greeting and Casual Messages:
- Respond warmly to greetings (hello, hi, hey) and introduce your capabilities
- For casual questions about your abilities, explain what you can do with tasks
- If users ask how you work, briefly explain the available commands
- For off-topic questions, politely redirect to task management

Error Handling:
- If a tool fails, explain what went wrong in simple terms
- Suggest alternatives when an action can't be completed
- Never expose technical error details to users
- If you can't find a task, confirm the task name and offer to list all tasks

Response Quality:
- Keep responses concise but friendly (2-3 sentences for confirmations)
- Use natural language, avoid robotic phrasing
- When listing multiple items, use bullet points or numbered lists
- Always acknowledge the user's intent before explaining limitations

Remember: You can only access tasks belonging to the authenticated user."""


async def create_chat_completion(
    messages: list,
    tools: list = None,
    user_id: str = None,
    temperature: float = 0.7,
    max_tokens: int = 500
):
    """
    Create a chat completion with tool calling support.

    Args:
        messages: List of conversation messages
        tools: List of available tool definitions (None to disable tool calling)
        user_id: User identifier for context
        temperature: Sampling temperature (0-2)
        max_tokens: Maximum tokens in response

    Returns:
        OpenAI chat completion response
    """
    try:
        # Build API call parameters
        api_params = {
            "model": "gpt-4-turbo-preview",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                *messages
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        # Only include tools and tool_choice if tools are provided
        if tools is not None:
            api_params["tools"] = tools
            api_params["tool_choice"] = "auto"

        # Add user_id if provided
        if user_id:
            api_params["user"] = user_id

        response = await client.chat.completions.create(**api_params)

        logger.info(f"Chat completion created for user {user_id}")
        return response

    except Exception as e:
        logger.error(f"Error creating chat completion: {str(e)}")
        raise


async def create_streaming_chat_completion(
    messages: list,
    tools: list,
    user_id: str,
    temperature: float = 0.7,
    max_tokens: int = 500
):
    """
    Create a streaming chat completion with tool calling support.

    Args:
        messages: List of conversation messages
        tools: List of available tool definitions
        user_id: User identifier for context
        temperature: Sampling temperature (0-2)
        max_tokens: Maximum tokens in response

    Returns:
        Async generator yielding response chunks
    """
    try:
        stream = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *messages
            ],
            tools=tools,
            tool_choice="auto",
            temperature=temperature,
            max_tokens=max_tokens,
            user=user_id,
            stream=True
        )

        logger.info(f"Streaming chat completion created for user {user_id}")
        return stream

    except Exception as e:
        logger.error(f"Error creating streaming chat completion: {str(e)}")
        raise
