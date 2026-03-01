# Feature Specification: MCP Tools + Agent Backend

**Feature Branch**: `005-mcp-tools-agent`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Phase III: Todo AI Chatbot – MCP Tools + DB + Agent Behavior"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - MCP Tool Operations (Priority: P1)

Developers can invoke MCP tools programmatically to perform task operations (add, list, complete, delete, update) with proper user isolation and structured responses.

**Why this priority**: This is the foundational layer that enables all task operations. Without working MCP tools, no other functionality can exist. This represents the core API that the AI agent will use.

**Independent Test**: Can be fully tested by directly calling each MCP tool function with test parameters and verifying the database state changes and response structure. Delivers immediate value as a programmatic task management API.

**Acceptance Scenarios**:

1. **Given** a user_id and task details, **When** add_task tool is invoked, **Then** a new task is created in the database with the correct user_id and a success response is returned
2. **Given** a user_id, **When** list_tasks tool is invoked, **Then** only tasks belonging to that user are returned in a structured format
3. **Given** a user_id and task_id, **When** complete_task tool is invoked, **Then** the task's completed status is updated and a confirmation response is returned
4. **Given** a user_id and task_id, **When** delete_task tool is invoked, **Then** the task is removed from the database and a success response is returned
5. **Given** a user_id, task_id, and updated fields, **When** update_task tool is invoked, **Then** the task is modified and a success response is returned

---

### User Story 2 - Agent Natural Language Mapping (Priority: P2)

The AI agent interprets natural language commands and maps them to appropriate MCP tool invocations with correct parameters, providing conversational responses.

**Why this priority**: This transforms the programmatic API into a user-friendly conversational interface. It builds on P1 by adding the intelligence layer that makes the system accessible to end users.

**Independent Test**: Can be tested by sending natural language messages to the agent and verifying that: (1) the correct MCP tool is invoked, (2) parameters are extracted correctly, (3) the agent provides a human-friendly confirmation response.

**Acceptance Scenarios**:

1. **Given** a message "Add a task to buy groceries", **When** the agent processes it, **Then** add_task tool is invoked with title="Buy groceries" and a confirmation message is returned
2. **Given** a message "Show me my tasks", **When** the agent processes it, **Then** list_tasks tool is invoked and tasks are formatted in a readable response
3. **Given** a message "Mark the groceries task as done", **When** the agent processes it, **Then** complete_task tool is invoked for the matching task and a confirmation is returned
4. **Given** an ambiguous message "Delete that task", **When** the agent processes it, **Then** the agent asks for clarification about which task to delete
5. **Given** a greeting "Hello", **When** the agent processes it, **Then** the agent responds with a friendly greeting and explains its capabilities without invoking any tools

---

### User Story 3 - Conversation State Management (Priority: P3)

The system maintains conversation history in the database, allowing stateless API design while preserving context across sessions for better user experience.

**Why this priority**: This enables conversation continuity and context awareness. While not essential for basic functionality, it significantly improves the user experience by allowing the agent to reference previous messages and maintain conversation threads.

**Independent Test**: Can be tested by: (1) sending multiple messages in a conversation, (2) verifying messages are stored in the database with correct conversation_id, (3) restarting the session and verifying the agent can resume with full context.

**Acceptance Scenarios**:

1. **Given** a new conversation, **When** the first message is sent, **Then** a new conversation record is created with a unique conversation_id
2. **Given** an existing conversation_id, **When** a message is sent, **Then** the message is stored with the correct conversation_id and role (user/assistant)
3. **Given** a conversation with history, **When** the agent processes a new message, **Then** the full conversation history is loaded and provided as context
4. **Given** a conversation_id from a previous session, **When** a new message is sent with that conversation_id, **Then** the conversation resumes with full context preserved
5. **Given** multiple concurrent conversations, **When** messages are sent, **Then** each conversation maintains its own isolated history

---

### Edge Cases

- What happens when a user tries to complete/delete/update a task that doesn't exist?
- How does the system handle a user trying to access another user's tasks?
- What happens when the OpenAI API is unavailable or rate-limited?
- How does the agent handle messages that don't map to any tool operation?
- What happens when database connection fails during tool execution?
- How does the system handle malformed or excessively long user messages?
- What happens when a tool execution partially succeeds (e.g., database write succeeds but response fails)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide five MCP tools: add_task, list_tasks, complete_task, delete_task, update_task
- **FR-002**: Each MCP tool MUST enforce user_id isolation, preventing cross-user data access
- **FR-003**: MCP tools MUST return structured responses with success/error status and relevant data
- **FR-004**: System MUST persist Task entities with fields: user_id, id, title, description, completed, created_at, updated_at
- **FR-005**: System MUST persist Conversation entities with fields: user_id, id, created_at, updated_at
- **FR-006**: System MUST persist Message entities with fields: user_id, id, conversation_id, role, content, tool_calls, created_at
- **FR-007**: AI agent MUST interpret natural language commands and map them to appropriate MCP tool invocations
- **FR-008**: AI agent MUST extract parameters from natural language (e.g., task title, task description)
- **FR-009**: AI agent MUST provide conversational responses confirming actions taken
- **FR-010**: AI agent MUST handle ambiguous requests by asking clarifying questions
- **FR-011**: AI agent MUST handle greetings and help requests without invoking tools
- **FR-012**: System MUST load conversation history when processing messages with an existing conversation_id
- **FR-013**: System MUST create new conversations automatically when no conversation_id is provided
- **FR-014**: System MUST store both user messages and agent responses in the database
- **FR-015**: System MUST include tool_calls metadata in stored messages when tools are invoked
- **FR-016**: API endpoint MUST follow stateless design, deriving all context from conversation_id and database
- **FR-017**: System MUST validate user authentication before executing any MCP tool
- **FR-018**: System MUST handle tool execution errors gracefully with user-friendly error messages
- **FR-019**: System MUST support conversation resumption across sessions using conversation_id
- **FR-020**: Database migrations MUST create all required tables with proper indexes and constraints

### Key Entities

- **Task**: Represents a todo item with title, description, completion status, and timestamps. Belongs to a specific user.
- **Conversation**: Represents a chat session between user and AI agent. Contains metadata about when the conversation started and was last updated.
- **Message**: Represents a single message in a conversation. Can be from user or assistant role. Includes the message content and any tool calls that were executed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five MCP tools execute successfully with valid inputs and return structured responses within 500ms
- **SC-002**: User isolation is enforced - users cannot access or modify tasks belonging to other users (100% isolation)
- **SC-003**: AI agent correctly maps 95% of common task management commands to appropriate MCP tools
- **SC-004**: AI agent extracts parameters correctly from natural language in 90% of cases
- **SC-005**: Conversation history is preserved across sessions - users can resume conversations with full context
- **SC-006**: System handles 100 concurrent conversations without data corruption or cross-contamination
- **SC-007**: Database queries for conversation history complete within 200ms for conversations with up to 100 messages
- **SC-008**: Tool execution errors result in user-friendly error messages, not technical stack traces
- **SC-009**: System maintains stateless API design - no session state stored in memory between requests
- **SC-010**: All database operations use transactions to ensure data consistency

## Assumptions *(optional)*

- OpenAI API key is available and valid
- Database (Neon PostgreSQL) is accessible and properly configured
- User authentication is handled by a separate system (Better Auth) and provides valid JWT tokens
- Users understand basic task management concepts (add, complete, delete tasks)
- Network connectivity is reliable for API calls to OpenAI
- Database schema migrations are run before the system starts
- User_id is extracted from authenticated JWT tokens and is trustworthy
- Conversation history is retained indefinitely (no automatic cleanup policy)

## Out of Scope *(optional)*

- Real-time collaboration (multiple users editing the same task)
- Task sharing or delegation between users
- Task categories, tags, or labels
- Task due dates or reminders
- Task priority levels
- Bulk operations (e.g., delete all completed tasks)
- Task search or filtering beyond basic list
- Export/import of tasks
- Task attachments or file uploads
- Conversation branching or forking
- Voice input/output for conversations
- Multi-language support for AI responses
- Custom AI agent personalities or tones
- Integration with external calendar or task management systems

## Dependencies *(optional)*

- **OpenAI Agents SDK**: Required for natural language processing and tool calling
- **Neon PostgreSQL**: Required for data persistence
- **Better Auth**: Required for user authentication and JWT token validation
- **FastAPI**: Required for API endpoint implementation
- **SQLModel**: Required for database ORM and async operations
- **Phase II Todo App**: Existing User and Task models from previous phase

## Security Considerations *(optional)*

- All MCP tools must validate user_id matches the authenticated user
- Database queries must filter by user_id to prevent data leakage
- JWT tokens must be validated on every API request
- SQL injection prevention through parameterized queries (SQLModel ORM)
- Input validation on all user-provided data (message length, task fields)
- Rate limiting to prevent API abuse
- Conversation_id validation to prevent unauthorized access to other users' conversations
- Tool execution errors must not expose sensitive system information
- Database connection strings and API keys must be stored in environment variables
- HTTPS required for all API communication in production
