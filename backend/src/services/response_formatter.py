"""
Response Formatter Service

Formats AI responses and error messages for user-friendly display.
"""
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


def format_error_message(error: Exception, context: Optional[str] = None) -> str:
    """
    Format an error into a user-friendly message.

    Args:
        error: The exception that occurred
        context: Optional context about what was being attempted

    Returns:
        User-friendly error message
    """
    error_msg = str(error).lower()

    # Rate limiting errors
    if "rate_limit" in error_msg or "429" in error_msg:
        return "I'm experiencing high demand right now. Please try again in a moment."

    # Timeout errors
    if "timeout" in error_msg or "timed out" in error_msg:
        return "The request took too long to process. Please try again."

    # Authentication errors
    if "unauthorized" in error_msg or "401" in error_msg or "403" in error_msg:
        return "There was an authentication issue. Please sign in again."

    # API key errors
    if "api_key" in error_msg or "invalid_api_key" in error_msg:
        return "There's a configuration issue. Please contact support."

    # Network errors
    if "connection" in error_msg or "network" in error_msg:
        return "I'm having trouble connecting. Please check your internet connection and try again."

    # Database errors
    if "database" in error_msg or "sql" in error_msg:
        return "I'm having trouble accessing your tasks. Please try again in a moment."

    # Task not found
    if "not found" in error_msg:
        if context:
            return f"I couldn't find {context}. Could you try again or list all tasks?"
        return "I couldn't find what you're looking for. Could you be more specific?"

    # Generic error with context
    if context:
        return f"I encountered an issue while {context}. Please try again."

    # Generic fallback
    return "I encountered an error processing your request. Please try again."


def format_tool_call_result(tool_name: str, result: Dict[str, Any]) -> str:
    """
    Format a tool call result into a human-readable message.

    Args:
        tool_name: Name of the tool that was called
        result: Result dictionary from tool execution

    Returns:
        Formatted message describing the result
    """
    success = result.get("success", False)

    if tool_name == "add_task":
        if success:
            task_title = result.get("task", {}).get("title", "the task")
            return f"✓ Added task: {task_title}"
        return "✗ Failed to add task"

    elif tool_name == "list_tasks":
        if success:
            tasks = result.get("tasks", [])
            count = len(tasks)
            if count == 0:
                return "You have no tasks"
            elif count == 1:
                return "You have 1 task"
            else:
                return f"You have {count} tasks"
        return "✗ Failed to list tasks"

    elif tool_name == "complete_task":
        if success:
            return "✓ Task marked as complete"
        return "✗ Failed to complete task"

    elif tool_name == "delete_task":
        if success:
            return "✓ Task deleted"
        return "✗ Failed to delete task"

    elif tool_name == "update_task":
        if success:
            return "✓ Task updated"
        return "✗ Failed to update task"

    # Generic fallback
    if success:
        return f"✓ {tool_name} completed successfully"
    return f"✗ {tool_name} failed"


def format_task_list(tasks: List[Dict[str, Any]], include_description: bool = False) -> str:
    """
    Format a list of tasks into a readable display.

    Args:
        tasks: List of task dictionaries
        include_description: Whether to include task descriptions

    Returns:
        Formatted task list string
    """
    if not tasks:
        return "You have no tasks."

    lines = []
    for i, task in enumerate(tasks, 1):
        title = task.get("title", "Untitled")
        completed = task.get("completed", False)
        status = "✓" if completed else "○"

        line = f"{i}. {status} {title}"

        if include_description and task.get("description"):
            line += f"\n   {task['description']}"

        lines.append(line)

    return "\n".join(lines)


def format_confirmation_message(action: str, details: Optional[str] = None) -> str:
    """
    Format a confirmation message for an action.

    Args:
        action: The action that was performed
        details: Optional details about the action

    Returns:
        Formatted confirmation message
    """
    confirmations = {
        "add": "I've added",
        "create": "I've created",
        "delete": "I've deleted",
        "remove": "I've removed",
        "complete": "I've marked as complete",
        "update": "I've updated",
        "change": "I've changed",
        "list": "Here are",
        "show": "Here are"
    }

    action_lower = action.lower()
    prefix = confirmations.get(action_lower, f"I've {action_lower}")

    if details:
        return f"{prefix} {details}"
    return prefix


def sanitize_response(response: str) -> str:
    """
    Sanitize AI response to ensure it's safe and appropriate.

    Args:
        response: Raw AI response

    Returns:
        Sanitized response
    """
    # Remove any potential code injection attempts
    response = response.replace("<script>", "").replace("</script>", "")
    response = response.replace("javascript:", "")

    # Trim excessive whitespace
    response = " ".join(response.split())

    # Ensure response isn't too long (max 1000 chars)
    if len(response) > 1000:
        response = response[:997] + "..."

    return response.strip()


def validate_response_quality(response: str) -> bool:
    """
    Validate that a response meets quality standards.

    Args:
        response: AI response to validate

    Returns:
        True if response meets quality standards
    """
    # Check minimum length
    if len(response.strip()) < 3:
        return False

    # Check for placeholder text
    placeholders = ["[placeholder]", "TODO", "FIXME", "XXX"]
    if any(placeholder in response for placeholder in placeholders):
        return False

    # Check for excessive repetition
    words = response.split()
    if len(words) > 5:
        unique_ratio = len(set(words)) / len(words)
        if unique_ratio < 0.3:  # Less than 30% unique words
            return False

    return True
