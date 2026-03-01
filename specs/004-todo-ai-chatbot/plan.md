# Implementation Plan: Todo AI Chatbot

**Branch**: `004-todo-ai-chatbot` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-todo-ai-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an AI-powered conversational interface for managing todos via natural language. Users interact with a chatbot that interprets commands (add, list, complete, delete, update tasks) and maintains conversation history across sessions. The system uses a stateless FastAPI backend with OpenAI Agents SDK for AI logic, ChatKit UI for the frontend, and Neon PostgreSQL for persistent storage of tasks, conversations, and messages.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Next.js 16+ (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, Next.js, ChatKit UI components, SQLModel, Neon PostgreSQL driver
**Storage**: Neon Serverless PostgreSQL (tasks, conversations, messages tables)
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web (browser client + server API)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <3 seconds response time for chat messages, <2 seconds for task operations
**Constraints**: Stateless backend (no in-memory sessions), MCP tools only (no direct DB access in API), user isolation enforced at all layers
**Scale/Scope**: Support 100 concurrent users, conversation history indefinite retention, 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase III Constitution Compliance

**I. Philosophy - Agentic Development Stack**
- ✅ Following Spec → Plan → Tasks → Claude Code workflow
- ✅ No manual coding - implementation via Claude Code agents
- ✅ MCP tools only for task operations (no direct DB access)

**II. Architecture - Stateless Backend**
- ✅ FastAPI server is stateless (no in-memory sessions)
- ✅ All state persisted in Neon PostgreSQL
- ✅ MCP tools handle all task operations
- ✅ Frontend (ChatKit) contains no business logic - pure presentation
- ✅ Clear separation: Frontend → API → MCP Tools → Database

**III. MCP Tools - Tool-Based Operations**
- ✅ Implementing 5 required MCP tools: add_task, list_tasks, complete_task, delete_task, update_task
- ✅ Agent confirms actions before execution
- ✅ Tool errors return human-readable messages
- ✅ All tools enforce user_id isolation
- ✅ All tools validate input parameters
- ✅ All tools log operations for audit trail

**IV. Database - Neon PostgreSQL Schema**
- ✅ Required tables: tasks, conversations, messages
- ✅ All tables include user_id for isolation
- ✅ All tables include created_at and updated_at timestamps
- ✅ Conversation recovery supported (fetch history by conversation_id)
- ✅ Indexes on user_id and created_at for query performance
- ✅ Foreign key constraints enforce referential integrity

**V. Conversation Flow - 7-Step Processing Pipeline**
- ✅ 1. Receive message via POST /api/{user_id}/chat
- ✅ 2. Fetch conversation history from database
- ✅ 3. Store user message to messages table
- ✅ 4. Run OpenAI Agents SDK with full context
- ✅ 5. Invoke MCP tools as needed
- ✅ 6. Store AI response and tool_calls to messages table
- ✅ 7. Return conversation_id, response, tool_calls to frontend

**VI. Security - Authentication & Isolation**
- ✅ Better Auth for authentication
- ✅ user_id verified on every API request
- ✅ Cross-user access prohibited - all queries filtered by user_id
- ✅ JWT tokens validated before processing
- ✅ Environment variables for all secrets

**VII. API - Chat Endpoint Structure**
- ✅ Endpoint: POST /api/{user_id}/chat
- ✅ Request: {message, conversation_id (optional)}
- ✅ Response: {conversation_id, response, tool_calls}
- ✅ Proper HTTP status codes for errors

**VIII. Evaluation - Quality Criteria**
- ✅ Functional: Agent responses contextually relevant, MCP tools execute successfully
- ✅ Technical: API response <3s, database queries optimized, error handling comprehensive
- ✅ Security: Authentication required, user_id validation, input validation

**GATE STATUS**: ✅ PASSED - All constitution requirements met

## Project Structure

### Documentation (this feature)

```text
specs/004-todo-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLModel entities (Task, Conversation, Message)
│   ├── services/        # Business logic (conversation_service, agent_service)
│   ├── api/             # FastAPI routes (/api/{user_id}/chat)
│   ├── mcp/             # MCP tool implementations (add_task, list_tasks, etc.)
│   ├── db/              # Database connection and migrations
│   └── auth/            # Better Auth integration and middleware
└── tests/
    ├── contract/        # API contract tests
    ├── integration/     # End-to-end flow tests
    └── unit/            # Service and tool unit tests

frontend/
├── src/
│   ├── components/      # ChatKit UI components (ChatInterface, MessageList, InputBox)
│   ├── app/             # Next.js App Router pages
│   ├── services/        # API client for backend communication
│   └── hooks/           # React hooks for chat state management
└── tests/
    └── components/      # Component tests
```

**Structure Decision**: Web application structure selected due to separate frontend (Next.js + ChatKit) and backend (FastAPI + OpenAI Agents SDK) requirements. Backend handles AI logic and MCP tool orchestration, frontend provides conversational UI with no business logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution requirements are met by the proposed architecture.
