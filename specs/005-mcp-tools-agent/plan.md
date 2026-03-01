# Implementation Plan: MCP Tools + Agent Backend

**Branch**: `005-mcp-tools-agent` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-mcp-tools-agent/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements the backend infrastructure for AI-powered conversational task management. It provides five MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) that serve as the exclusive interface for task operations, an AI agent that maps natural language to tool invocations, and a stateless conversation system that maintains context through database persistence. The system follows a 7-step conversation pipeline and enforces strict user isolation at all layers.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, OpenAI Python SDK, SQLModel, asyncpg, python-jose, bcrypt
**Storage**: Neon Serverless PostgreSQL with connection pooling
**Testing**: pytest with async support, contract tests for MCP tools
**Target Platform**: Linux server (containerized deployment)
**Project Type**: Web (backend API + frontend already exists from 004-todo-ai-chatbot)
**Performance Goals**: <2s API response time, <500ms MCP tool execution, 100 concurrent conversations
**Constraints**: Stateless API design, MCP-only database access, <200ms conversation history queries
**Scale/Scope**: Multi-user system, unlimited conversations per user, 5 MCP tools, 3 database tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Version**: 2.0.0 (Phase III - Agentic Conversational AI System)

### Initial Check (Before Phase 0) - ✅ PASS

All principles satisfied. No violations detected.

### Post-Design Check (After Phase 1) - ✅ PASS

**Design Artifacts Reviewed**:
- research.md: Technical decisions documented
- data-model.md: Database schema with user isolation
- contracts/mcp-tools.md: 5 MCP tools with security enforcement
- contracts/chat-api.md: Stateless API with 7-step pipeline
- quickstart.md: Implementation guide

### Principle Compliance

✅ **I. Philosophy - Agentic Development Stack**
- Feature follows Spec → Plan → Tasks → Claude Code workflow
- Implementation will be via Claude Code agents (no manual coding)
- All database operations via MCP tools (no direct access)
- COMPLIANT

✅ **II. Architecture - Stateless Backend**
- FastAPI server designed as stateless (no in-memory sessions)
- All state persisted in Neon PostgreSQL
- MCP tools handle ALL task operations
- Frontend contains no business logic
- COMPLIANT

✅ **III. MCP Tools - Tool-Based Operations**
- Implements all 5 required MCP tools: add_task, list_tasks, complete_task, delete_task, update_task
- Tools enforce user_id isolation
- Tools return human-readable error messages
- Agent confirms actions before execution
- COMPLIANT

✅ **IV. Database - Neon PostgreSQL Schema**
- Implements required tables: tasks, conversations, messages
- All tables include user_id for isolation
- Timestamps (created_at, updated_at) on all tables
- Supports conversation recovery via conversation_id
- COMPLIANT

✅ **V. Conversation Flow - 7-Step Pipeline**
- Implements exact 7-step sequence: receive → fetch → store → agent → tools → store → respond
- Conversation history loaded from database
- Messages persisted with tool_calls metadata
- COMPLIANT

✅ **VI. Security - Authentication & Isolation**
- Better Auth integration for authentication
- user_id verification on every request
- Cross-user access prevention via query filtering
- JWT token validation
- COMPLIANT

✅ **VII. API - Chat Endpoint Structure**
- POST /api/{user_id}/chat endpoint
- Request includes message and optional conversation_id
- Response includes conversation_id, response, and tool_calls
- COMPLIANT

✅ **VIII. Evaluation - Quality Criteria**
- Functional quality: Agent responses, tool execution, conversation history
- Technical quality: Response time <2s, optimized queries, error handling
- Security quality: Authentication, user_id validation, input validation
- COMPLIANT

**GATE STATUS**: ✅ PASS - No violations. Feature fully aligns with constitution principles.

**Design Validation**: All design artifacts (data model, contracts, quickstart) maintain compliance with constitution. Ready for task breakdown phase.

## Project Structure

### Documentation (this feature)

```text
specs/005-mcp-tools-agent/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── mcp-tools.md     # MCP tool specifications
│   └── chat-api.md      # Chat API endpoint specification
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/              # SQLModel entities
│   │   ├── conversation.py  # Conversation model
│   │   ├── message.py       # Message model with MessageRole enum
│   │   └── task.py          # Task model (from Phase II)
│   ├── services/            # Business logic layer
│   │   ├── agent_service.py        # AI agent with natural language processing
│   │   ├── conversation_service.py # Conversation and message persistence
│   │   ├── openai_client.py        # OpenAI SDK client with system prompt
│   │   └── response_formatter.py   # Response formatting utilities
│   ├── mcp/                 # MCP tool implementations
│   │   ├── add_task.py      # Create new task
│   │   ├── list_tasks.py    # Retrieve user's tasks
│   │   ├── complete_task.py # Mark task as completed
│   │   ├── delete_task.py   # Remove task
│   │   ├── update_task.py   # Modify task properties
│   │   └── registry.py      # Tool registry with OpenAI function definitions
│   ├── api/                 # FastAPI routes
│   │   ├── chat.py          # POST /api/{user_id}/chat endpoint
│   │   └── conversations.py # Conversation history endpoints
│   ├── db/                  # Database layer
│   │   ├── connection.py    # Async SQLModel connection with pooling
│   │   └── migrations/      # Database migration scripts
│   │       ├── 002_create_conversations.py
│   │       └── 003_create_messages.py
│   └── auth/                # Authentication layer
│       ├── middleware.py    # JWT authentication middleware
│       └── utils.py         # User ID extraction and validation
├── tests/
│   ├── unit/                # Unit tests for MCP tools and services
│   ├── integration/         # API endpoint integration tests
│   └── contract/            # Contract tests for MCP tools
├── requirements.txt         # Python dependencies
└── .env.example            # Environment variable template

frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx      # Main chat container
│   │   ├── MessageList.tsx        # Message display with auto-scroll
│   │   ├── InputBox.tsx           # Text input with send button
│   │   ├── ConversationList.tsx   # Sidebar with conversation history
│   │   └── ConversationItem.tsx   # Individual conversation item
│   ├── app/                 # Next.js App Router pages
│   │   └── chat/
│   │       └── page.tsx     # Main chat page
│   ├── services/            # API client layer
│   │   └── api-client.ts    # Chat API client with TypeScript types
│   └── hooks/               # React hooks
│       ├── useChatState.ts        # Chat state management
│       └── useConversations.ts    # Conversation list management
├── tests/
│   ├── components/          # Component tests
│   └── integration/         # End-to-end tests
├── package.json             # Node.js dependencies
└── .env.local.example      # Environment variable template
```

**Structure Decision**: Web application structure with separate backend and frontend directories. Backend uses FastAPI with layered architecture (models → services → MCP tools → API). Frontend uses Next.js App Router with component-based architecture. This structure supports the stateless backend principle and clear separation of concerns mandated by the constitution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations detected. All constitution principles are satisfied.

This feature fully aligns with the Phase III constitution:
- Follows Agentic Dev Stack workflow
- Implements stateless backend architecture
- Uses MCP tools exclusively for database operations
- Maintains strict user isolation
- Implements 7-step conversation pipeline
- Integrates Better Auth for authentication
- Follows prescribed API structure

No complexity justification required.
