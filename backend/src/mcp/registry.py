"""
MCP Tool Registry

Central registry for all MCP (Model Context Protocol) tools.
Maps tool names to their implementations for the AI agent.
"""
from typing import Dict, Callable, Any
from sqlmodel.ext.asyncio.session import AsyncSession
import logging

from .add_task import add_task
from .list_tasks import list_tasks
from .complete_task import complete_task
from .delete_task import delete_task
from .update_task import update_task

logger = logging.getLogger(__name__)


# Tool registry mapping tool names to functions
TOOL_REGISTRY: Dict[str, Callable] = {
    "add_task": add_task,
    "list_tasks": list_tasks,
    "complete_task": complete_task,
    "delete_task": delete_task,
    "update_task": update_task,
}


async def execute_tool(
    tool_name: str,
    params: Dict[str, Any],
    session: AsyncSession
) -> Dict[str, Any]:
    """
    Execute an MCP tool by name.

    Args:
        tool_name: Name of the tool to execute
        params: Parameters for the tool
        session: Async database session

    Returns:
        Tool execution result

    Raises:
        ValueError: If tool name is not found in registry
    """
    logger.info(f"execute_tool called: tool_name={tool_name}, params={params}")
    print(f"DEBUG execute_tool: tool_name={tool_name}, params={params}")

    if tool_name not in TOOL_REGISTRY:
        logger.error(f"Unknown tool requested: {tool_name}")
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}"
        }

    tool_func = TOOL_REGISTRY[tool_name]

    try:
        logger.info(f"Executing tool function: {tool_name}")
        result = await tool_func(params, session)
        logger.info(f"Tool {tool_name} executed successfully: {result}")
        print(f"DEBUG execute_tool result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {str(e)}", exc_info=True)
        print(f"DEBUG execute_tool exception: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Tool execution failed: {str(e)}"
        }


def get_tool_definitions() -> list:
    """
    Get OpenAI function definitions for all registered tools.

    Returns:
        List of tool definitions in OpenAI function calling format
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "add_task",
                "description": "Create a new task for the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User's unique identifier (UUID)"
                        },
                        "title": {
                            "type": "string",
                            "description": "Task title (1-200 characters)"
                        },
                        "description": {
                            "type": "string",
                            "description": "Optional task description (max 2000 characters)"
                        }
                    },
                    "required": ["user_id", "title"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "list_tasks",
                "description": "Retrieve all tasks for the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User's unique identifier (UUID)"
                        },
                        "completed": {
                            "type": "boolean",
                            "description": "Filter by completion status (optional)"
                        }
                    },
                    "required": ["user_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "complete_task",
                "description": "Mark a task as completed",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User's unique identifier (UUID)"
                        },
                        "task_id": {
                            "type": "string",
                            "description": "Task's unique identifier (UUID)"
                        }
                    },
                    "required": ["user_id", "task_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_task",
                "description": "Permanently delete a task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User's unique identifier (UUID)"
                        },
                        "task_id": {
                            "type": "string",
                            "description": "Task's unique identifier (UUID)"
                        }
                    },
                    "required": ["user_id", "task_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_task",
                "description": "Update task title and/or description",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User's unique identifier (UUID)"
                        },
                        "task_id": {
                            "type": "string",
                            "description": "Task's unique identifier (UUID)"
                        },
                        "title": {
                            "type": "string",
                            "description": "New task title (optional, 1-200 characters)"
                        },
                        "description": {
                            "type": "string",
                            "description": "New task description (optional, max 2000 characters)"
                        }
                    },
                    "required": ["user_id", "task_id"]
                }
            }
        }
    ]
