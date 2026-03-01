<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 2.0.0 (MAJOR)
Date: 2026-02-26

RATIONALE FOR MAJOR BUMP:
- Breaking architectural change: Direct database access → MCP tools only
- Core workflow redefined: Traditional development → Agentic Dev Stack (Spec → Plan → Tasks → Claude Code)
- New feature domain: Todo CRUD app → Conversational AI system with task management
- Mandatory constraints added: No manual coding, MCP-only operations
- Security model expanded: Better Auth + user_id verification + conversation isolation

MODIFIED PRINCIPLES:
- I. Philosophy: NEW - Agentic Dev Stack workflow, no manual coding
- II. Architecture: REDEFINED - Stateless FastAPI, MCP tools, no business logic in frontend
- III. MCP Tools: NEW - Tool-based task operations with confirmation
- IV. Database: UPDATED - Added conversations and messages tables, conversation recovery
- V. Conversation Flow: NEW - 7-step conversation processing pipeline
- VI. Security: UPDATED - Better Auth + user_id verification + cross-user isolation
- VII. API: REDEFINED - Chat endpoint structure with conversation_id
- VIII. Evaluation: NEW - Quality criteria for responses and tool usage

REMOVED SECTIONS:
- UI/UX Excellence (Phase II principle)
- Reproducibility (Phase II principle)
- Scalability & Modularity (Phase II principle)
- Rigor & Quality (Phase II principle)
- Frontend Architecture standards
- Testing Standards (moved to evaluation)
- CI/CD Standards
- Feature Constraints (Phase II specific)
- Optional Enhancements (Phase II specific)

ADDED SECTIONS:
- Philosophy (Agentic workflow)
- MCP Tools (tool definitions and requirements)
- Conversation Flow (processing pipeline)
- Evaluation (quality criteria)

TEMPLATES REQUIRING UPDATES:
- ✅ .specify/templates/spec-template.md - No MCP-specific updates needed (generic template)
- ✅ .specify/templates/plan-template.md - Constitution Check section will auto-adapt
- ✅ .specify/templates/tasks-template.md - No MCP-specific updates needed (generic template)
- ⚠ README.md - May need Phase III architecture documentation (PENDING USER REVIEW)
- ⚠ docs/ - May need conversation flow and MCP tool documentation (PENDING USER REVIEW)

FOLLOW-UP TODOS:
- None (all placeholders filled)

-->

# Project Constitution

**Project:** Phase III - Agentic Conversational AI System with MCP Task Management

## Core Principles

### I. Philosophy

**Agentic Development Stack (NON-NEGOTIABLE)**

- All development MUST follow: Spec → Plan → Tasks → Claude Code
- Manual coding is PROHIBITED - all implementation via Claude Code agents
- Direct database access is PROHIBITED - all operations via MCP tools only
- Agents are the primary interface for all task operations
- Specifications drive implementation, not ad-hoc coding

**Rationale**: This ensures reproducibility, traceability, and prevents technical debt from manual interventions. Every change is documented and follows a deliberate workflow.

### II. Architecture

**Stateless Backend (MANDATORY)**

- FastAPI server MUST be stateless - no in-memory session storage
- All state persisted in Neon PostgreSQL database
- MCP tools handle ALL task operations (add, list, complete, delete, update)
- Frontend (ChatKit) contains NO business logic - pure presentation layer
- Clear separation: Frontend → API → MCP Tools → Database

**Rationale**: Stateless architecture enables horizontal scaling, simplifies deployment, and ensures all state is recoverable from the database.

### III. MCP Tools

**Tool-Based Operations (MANDATORY)**

The following MCP tools MUST be implemented and used for all task operations:

- `add_task`: Create new tasks with user_id, title, description
- `list_tasks`: Retrieve tasks filtered by user_id
- `complete_task`: Mark task as completed with timestamp
- `delete_task`: Remove task from database
- `update_task`: Modify task properties (title, description, status)

**Tool Requirements**:
- Agent MUST confirm all actions before execution
- Tool errors MUST return human-readable messages
- All tools MUST enforce user_id isolation
- All tools MUST validate input parameters
- All tools MUST log operations for audit trail

**Rationale**: MCP tools provide a controlled, auditable interface that prevents direct database manipulation and enforces security boundaries.

### IV. Database

**Neon PostgreSQL Schema (MANDATORY)**

Required tables:
- `tasks`: user_id, task_id, title, description, completed, created_at, updated_at
- `conversations`: conversation_id, user_id, created_at, updated_at
- `messages`: message_id, conversation_id, role (user/assistant), content, tool_calls, created_at

**Schema Requirements**:
- All tables MUST include user_id for isolation
- All tables MUST include created_at and updated_at timestamps
- Conversation recovery MUST be supported (fetch history by conversation_id)
- Indexes MUST be created on user_id and created_at for query performance
- Foreign key constraints MUST enforce referential integrity

**Rationale**: Structured schema with timestamps and user isolation enables conversation recovery, audit trails, and multi-user support.

### V. Conversation Flow

**7-Step Processing Pipeline (MANDATORY)**

Every user message MUST follow this exact sequence:

1. **Receive message** - Accept user input via POST /api/{user_id}/chat
2. **Fetch history** - Retrieve conversation history from database by conversation_id
3. **Store user message** - Persist user message to messages table
4. **Run agent** - Execute Claude Code agent with full conversation context
5. **Invoke MCP tools** - Agent calls MCP tools as needed (add_task, list_tasks, etc.)
6. **Store AI response** - Persist assistant message and tool_calls to messages table
7. **Return response** - Send conversation_id, response, and tool_calls to frontend

**Rationale**: This pipeline ensures every conversation is recoverable, auditable, and maintains context across sessions.

### VI. Security

**Authentication & Isolation (MANDATORY)**

- Better Auth MUST be used for authentication
- user_id MUST be verified on every API request
- Cross-user access is PROHIBITED - all queries filtered by user_id
- JWT tokens MUST be validated before processing requests
- Passwords MUST be hashed with bcrypt or argon2
- Environment variables MUST be used for all secrets
- No secrets committed to version control

**Rationale**: Multi-user systems require strict isolation to prevent data leaks and unauthorized access.

### VII. API

**Chat Endpoint Structure (MANDATORY)**

- **Endpoint**: POST /api/{user_id}/chat
- **Request Body**:
  ```json
  {
    "message": "user message text",
    "conversation_id": "optional - creates new if omitted"
  }
  ```
- **Response Body**:
  ```json
  {
    "conversation_id": "uuid",
    "response": "assistant response text",
    "tool_calls": [
      {"tool": "add_task", "parameters": {...}, "result": "..."}
    ]
  }
  ```

**API Requirements**:
- user_id MUST be extracted from authenticated session
- conversation_id MUST be returned for conversation continuity
- tool_calls MUST be included for transparency
- Errors MUST return proper HTTP status codes (400, 401, 403, 500)
- All responses MUST be JSON formatted

**Rationale**: Consistent API structure simplifies frontend integration and enables conversation recovery.

### VIII. Evaluation

**Quality Criteria (MANDATORY)**

All implementations MUST meet these criteria:

**Functional Quality**:
- Agent responses are contextually relevant and accurate
- MCP tools execute successfully without errors
- Conversation history is correctly maintained across sessions
- Task operations (CRUD) work reliably for all users
- User isolation is enforced at all layers

**Technical Quality**:
- API response time < 2 seconds for typical requests
- Database queries optimized with proper indexes
- Error handling covers all failure modes
- Logging captures all critical operations
- Code follows FastAPI and Next.js best practices

**Security Quality**:
- Authentication required for all protected endpoints
- user_id validation prevents cross-user access
- Input validation prevents injection attacks
- Secrets never exposed in logs or responses
- HTTPS enforced in production

**Rationale**: Clear quality criteria enable objective evaluation and prevent technical debt.

## Key Standards

### Backend Architecture

- **Framework**: FastAPI (Python 3.11+)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel for type-safe database operations
- **Authentication**: Better Auth with JWT tokens
- **API Design**: RESTful with OpenAPI/Swagger documentation
- **Validation**: Pydantic models for all requests/responses
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **MCP Integration**: All task operations via MCP tools (no direct DB access)

### Frontend Architecture

- **Framework**: Next.js 16+ with App Router
- **UI Library**: ChatKit or equivalent conversational UI components
- **Styling**: TailwindCSS for responsive design
- **State Management**: React hooks, Context API for auth state
- **Type Safety**: TypeScript for type checking
- **API Client**: Fetch API with proper error handling
- **No Business Logic**: Frontend is pure presentation layer

### Database Standards

- **Provider**: Neon Serverless PostgreSQL
- **Schema**: User isolation enforced at database level (user_id in all tables)
- **Migrations**: Tracked and version-controlled
- **Indexes**: Optimized for common queries (user_id, created_at, conversation_id)
- **Constraints**: Foreign keys, unique constraints, not null where appropriate
- **Connection Pooling**: Configured for optimal performance

### MCP Tool Standards

- **Tool Naming**: Lowercase with underscores (add_task, list_tasks)
- **Parameter Validation**: All inputs validated before execution
- **Error Messages**: Human-readable, actionable error descriptions
- **Confirmation**: Agent confirms actions before execution
- **Logging**: All tool invocations logged with user_id and timestamp
- **Idempotency**: Tools handle duplicate requests gracefully

## Constraints

### Implementation Constraints

- All development via Claude Code agents (no manual coding)
- Follow Spec-Driven Development process strictly (Spec → Plan → Tasks → Implement)
- Use specialized agents for their domains (backend, frontend, database, auth)
- No shortcuts or deviations from established patterns
- MCP tools are the ONLY interface for task operations

### Security Constraints

- Never commit secrets or tokens to version control
- Use `.env` files for local development
- Environment variables for production secrets
- Secure password hashing (bcrypt/argon2)
- JWT tokens with proper expiration and refresh logic
- Input validation on all user-provided data
- user_id verification on every authenticated request

### Architecture Constraints

- FastAPI server MUST be stateless (no in-memory sessions)
- MCP tools handle ALL task operations (no direct DB access in API routes)
- Frontend contains NO business logic (pure presentation)
- Database connection pooling for performance
- No tight coupling between layers
- Conversation history stored in database for recovery

### Feature Constraints

- Full CRUD operations for tasks via MCP tools
- Conversation history persistence and recovery
- User authentication (signup, signin, signout)
- Multi-user support with strict isolation
- Conversational AI interface (not traditional form-based UI)
- Tool call transparency (show what tools were invoked)

## Success Criteria

### Functionality

- ✅ Users can authenticate securely (signup, signin, signout)
- ✅ Users can interact with AI agent via conversational interface
- ✅ Agent can add, list, complete, delete, and update tasks via MCP tools
- ✅ Conversation history persists and recovers across sessions
- ✅ Each user sees only their own tasks and conversations (enforced at API and DB levels)

### Security

- ✅ Secure authentication with JWT tokens via Better Auth
- ✅ User isolation enforced at API and database levels
- ✅ No XSS or SQL injection vulnerabilities
- ✅ Secrets managed via environment variables
- ✅ Passwords properly hashed and never stored in plain text

### Architecture

- ✅ FastAPI server is stateless (no in-memory sessions)
- ✅ All task operations go through MCP tools (no direct DB access)
- ✅ Frontend contains no business logic (pure presentation)
- ✅ Conversation flow follows 7-step pipeline exactly
- ✅ Database schema supports conversation recovery

### Code Quality

- ✅ Clean, modular, scalable codebase
- ✅ Well-documented APIs and MCP tools
- ✅ Type-safe where applicable (Pydantic, TypeScript)
- ✅ Follows established patterns and conventions
- ✅ No code duplication or unnecessary complexity

### Performance

- ✅ API response time < 2 seconds for typical requests
- ✅ Database queries optimized with proper indexes
- ✅ Connection pooling configured for optimal performance
- ✅ Frontend loads quickly with code splitting
- ✅ Handles concurrent users without degradation

## Governance

This constitution supersedes all other practices and guidelines. All development work must comply with these principles and standards.

### Amendment Process

- Amendments require documentation of rationale
- Significant changes require ADR creation
- Migration plan required for breaking changes
- Version bump follows semantic versioning:
  - MAJOR: Breaking changes to principles or architecture
  - MINOR: New principles or sections added
  - PATCH: Clarifications, wording fixes, non-semantic refinements

### Compliance

- All PRs must verify compliance with constitution
- Code reviews must check adherence to standards
- Complexity must be justified with clear reasoning
- Deviations require explicit approval and documentation
- MCP tool usage is mandatory (no direct DB access)

### Versioning Policy

- Constitution version follows semantic versioning (MAJOR.MINOR.PATCH)
- RATIFICATION_DATE is the original adoption date (never changes)
- LAST_AMENDED_DATE updates on every amendment
- Version history maintained in git commits

---

**Version:** 2.0.0
**Ratified:** 2026-02-23
**Last Amended:** 2026-02-26
