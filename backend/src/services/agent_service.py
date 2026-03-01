"""
Agent Service

Handles AI agent interactions using OpenAI Agents SDK.
Processes natural language, invokes MCP tools, and generates responses.
"""
from typing import List, Dict, Any, Optional
import json
import logging

from src.services.openai_client import create_chat_completion
from src.mcp.registry import get_tool_definitions, execute_tool
from src.services.response_formatter import (
    validate_response_quality,
    sanitize_response,
    format_error_message
)
from sqlmodel.ext.asyncio.session import AsyncSession

logger = logging.getLogger(__name__)


def detect_clarification_request(response_text: str) -> bool:
    """
    Detect if the AI response is asking for clarification.

    Args:
        response_text: AI's response text

    Returns:
        True if response appears to be asking for clarification
    """
    clarification_indicators = [
        "which one",
        "which task",
        "can you clarify",
        "could you specify",
        "do you mean",
        "which would you like",
        "please specify",
        "can you be more specific",
        "?",  # Contains question mark
    ]

    response_lower = response_text.lower()

    # Check for question marks (strong indicator)
    if "?" in response_text:
        return True

    # Check for clarification phrases
    return any(indicator in response_lower for indicator in clarification_indicators)


def detect_ambiguous_input(user_message: str, conversation_history: List[Dict[str, Any]]) -> Optional[str]:
    """
    Detect potentially ambiguous user input that may need clarification.

    Args:
        user_message: User's input message
        conversation_history: Previous conversation messages

    Returns:
        Ambiguity type if detected, None otherwise
    """
    message_lower = user_message.lower().strip()

    # Detect vague references
    vague_references = ["it", "that", "this", "the task", "that one", "this one"]
    if any(ref in message_lower for ref in vague_references):
        # Check if there's recent context
        if len(conversation_history) < 2:
            return "vague_reference"

    # Detect incomplete commands
    incomplete_patterns = [
        "add task",
        "create task",
        "delete",
        "remove",
        "complete",
        "update",
        "change"
    ]

    if any(pattern in message_lower for pattern in incomplete_patterns):
        # Check if message is very short (likely incomplete)
        if len(message_lower.split()) <= 2:
            return "incomplete_command"

    return None


def detect_greeting(user_message: str) -> bool:
    """
    Detect if the user message is a greeting.

    Args:
        user_message: User's input message

    Returns:
        True if message is a greeting
    """
    message_lower = user_message.lower().strip()

    greetings = [
        "hello", "hi", "hey", "greetings", "good morning",
        "good afternoon", "good evening", "howdy", "what's up",
        "sup", "yo"
    ]

    # Check if message starts with or is exactly a greeting
    for greeting in greetings:
        if message_lower == greeting or message_lower.startswith(greeting + " "):
            return True

    return False


def detect_help_request(user_message: str) -> bool:
    """
    Detect if the user is asking for help or capabilities.

    Args:
        user_message: User's input message

    Returns:
        True if message is asking for help
    """
    message_lower = user_message.lower().strip()

    help_patterns = [
        "help", "what can you do", "how do you work", "what do you do",
        "capabilities", "commands", "how to use", "instructions",
        "what are you", "who are you", "what's your purpose"
    ]

    return any(pattern in message_lower for pattern in help_patterns)


async def process_user_message(
    user_message: str,
    conversation_history: List[Dict[str, Any]],
    user_id: str,
    session: AsyncSession
) -> Dict[str, Any]:
    """
    Process user message through AI agent with tool calling.

    Args:
        user_message: User's natural language input
        conversation_history: Previous messages in conversation
        user_id: User identifier
        session: Database session for tool execution

    Returns:
        Dictionary with response and tool_calls
    """
    try:
        # Handle greetings with quick response
        if detect_greeting(user_message):
            return {
                "response": "Hello! I'm your task management assistant. I can help you add, list, complete, update, or delete tasks. What would you like to do?",
                "tool_calls": []
            }

        # Handle help requests with quick response
        if detect_help_request(user_message):
            return {
                "response": "I can help you manage your tasks! Here's what I can do:\n\n• Add tasks: 'Add a task to buy groceries'\n• List tasks: 'Show me my tasks' or 'What do I need to do?'\n• Complete tasks: 'Mark buy groceries as done'\n• Update tasks: 'Change the task title to...'\n• Delete tasks: 'Delete the groceries task'\n\nJust tell me what you'd like to do in natural language!",
                "tool_calls": []
            }

        # Detect ambiguous input
        ambiguity_type = detect_ambiguous_input(user_message, conversation_history)
        if ambiguity_type:
            logger.info(f"Detected ambiguous input: {ambiguity_type}")
            # Let the AI handle clarification through the normal flow

        # Get tool definitions for OpenAI
        tools = get_tool_definitions()

        # Build messages array from history
        messages = []
        for msg in conversation_history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Call OpenAI with tools
        response = await create_chat_completion(
            messages=messages,
            tools=tools,
            user_id=str(user_id)
        )

        assistant_message = response.choices[0].message

        # Check if agent wants to call tools
        tool_calls_data = []
        if assistant_message.tool_calls:
            logger.info(f"Agent requested {len(assistant_message.tool_calls)} tool calls")

            # Execute each tool call
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                tool_params = json.loads(tool_call.function.arguments)

                # Ensure user_id is in params for security
                tool_params["user_id"] = str(user_id)

                logger.info(f"Executing tool: {tool_name}")

                # Execute tool
                tool_result = await execute_tool(
                    tool_name=tool_name,
                    params=tool_params,
                    session=session
                )

                logger.info(f"Tool {tool_name} result: {tool_result}")
                print(f"DEBUG: Tool {tool_name} executed with result: {tool_result}")

                tool_calls_data.append({
                    "tool": tool_name,
                    "parameters": tool_params,
                    "result": "success" if tool_result.get("success") else "error",
                    "task_id": tool_result.get("task_id")
                })

            # Get final response after tool execution
            # Add tool results to conversation
            messages.append({
                "role": "assistant",
                "content": assistant_message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            })

            # Add tool results
            for i, tool_call in enumerate(assistant_message.tool_calls):
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_calls_data[i])
                })

            # Get final response (without tools to prevent recursive tool calling)
            # Use lower max_tokens for faster response generation
            final_response = await create_chat_completion(
                messages=messages,
                tools=None,  # Don't allow more tool calls in final response
                user_id=str(user_id),
                max_tokens=150  # Reduced for faster responses
            )

            final_content = final_response.choices[0].message.content

        else:
            # No tool calls, use direct response
            final_content = assistant_message.content
            tool_calls_data = []

        # Validate and sanitize response
        if not final_content:
            final_content = "I'm not sure how to respond to that. Could you rephrase your request?"

        final_content = sanitize_response(final_content)

        if not validate_response_quality(final_content):
            logger.warning(f"Response quality validation failed for user {user_id}")
            final_content = "I apologize, but I couldn't generate a proper response. Could you try asking in a different way?"

        return {
            "response": final_content,
            "tool_calls": tool_calls_data
        }

    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise


async def handle_agent_error(error: Exception) -> str:
    """
    Generate user-friendly error message from agent error.

    Args:
        error: Exception that occurred

    Returns:
        User-friendly error message
    """
    error_msg = str(error)

    if "rate_limit" in error_msg.lower():
        return "I'm experiencing high demand right now. Please try again in a moment."
    elif "timeout" in error_msg.lower():
        return "The request took too long. Please try again."
    elif "api_key" in error_msg.lower():
        return "There's a configuration issue. Please contact support."
    else:
        return "I encountered an error processing your request. Please try again."
