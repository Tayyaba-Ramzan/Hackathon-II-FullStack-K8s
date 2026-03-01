# Tasks: MCP Tools + Agent Backend

**Input**: Design documents from `/specs/005-mcp-tools-agent/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` for all Python source code
- **Models**: `backend/src/models/`
- **Services**: `backend/src/services/`
- **MCP Tools**: `backend/src/mcp/`
- **API Routes**: `backend/src/api/`
- **Database**: `backend/src/db/`
- **Auth**: `backend/src/auth/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify backend project structure matches plan.md (backend/src/ with subdirectories: models, services, mcp, api, db, auth)
- [X] T002 Install Python dependencies in backend/requirements.txt (fastapi, uvicorn, sqlmodel, asyncpg, openai, python-jose, bcrypt, pydantic)
- [X] T003 [P] Configure environment variables in backend/.env.example (DATABASE_URL, OPENAI_API_KEY, JWT_SECRET, BETTER_AUTH_SECRET)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create database connection module in backend/src/db/connection.py (async SQLModel connection, Neon PostgreSQL, connection pooling 10-20 connections)
- [X] T005 [P] Create Conversation model in backend/src/models/conversation.py (fields: conversation_id UUID PK, user_id UUID FK, title VARCHAR(255) optional, created_at TIMESTAMP, updated_at TIMESTAMP)
- [X] T006 [P] Create Message model in backend/src/models/message.py (fields: message_id UUID PK, conversation_id UUID FK, user_id UUID FK, role ENUM user/assistant, content TEXT, tool_calls JSONB optional, created_at TIMESTAMP)
- [X] T007 Create database migration for conversations table in backend/src/db/migrations/002_create_conversations.py (CREATE TABLE with indexes on user_id and updated_at)
- [X] T008 Create database migration for messages table in backend/src/db/migrations/003_create_messages.py (CREATE TABLE with indexes on conversation_id and created_at)
- [X] T009 [P] Implement authentication middleware in backend/src/auth/middleware.py (JWT token validation, user_id extraction, Better Auth integration)
- [X] T010 [P] Create user ID extraction utilities in backend/src/auth/utils.py (extract user_id from JWT, validate token signature)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - MCP Tool Operations (Priority: P1) 🎯 MVP

**Goal**: Developers can invoke MCP tools programmatically to perform task operations (add, list, complete, delete, update) with proper user isolation and structured responses.

**Independent Test**: Can be fully tested by directly calling each MCP tool function with test parameters and verifying the database state changes and response structure. Delivers immediate value as a programmatic task management API.

### Implementation for User Story 1

- [X] T011 [P] [US1] Create add_task MCP tool in backend/src/mcp/add_task.py (async function, parameters: user_id UUID, title str, description str optional, returns structured response with success/message/data)
- [X] T012 [P] [US1] Create list_tasks MCP tool in backend/src/mcp/list_tasks.py (async function, parameters: user_id UUID, completed bool optional, returns list of tasks filtered by user_id)
- [X] T013 [P] [US1] Create complete_task MCP tool in backend/src/mcp/complete_task.py (async function, parameters: user_id UUID, task_id UUID, updates completed=true, enforces user_id isolation)
- [X] T014 [P] [US1] Create delete_task MCP tool in backend/src/mcp/delete_task.py (async function, parameters: user_id UUID, task_id UUID, permanently deletes task, enforces user_id isolation)
- [X] T015 [P] [US1] Create update_task MCP tool in backend/src/mcp/update_task.py (async function, parameters: user_id UUID, task_id UUID, title str optional, description str optional, enforces user_id isolation)
- [X] T016 [US1] Create MCP tool registry in backend/src/mcp/registry.py (get_tool_definitions returns OpenAI function schemas, execute_tool dispatches to correct tool, injects user_id from session)
- [X] T017 [P] [US1] Create response formatter utilities in backend/src/services/response_formatter.py (format tool responses, handle errors, create user-friendly messages)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. All 5 MCP tools can be invoked programmatically with proper user isolation.

---

## Phase 4: User Story 2 - Agent Natural Language Mapping (Priority: P2)

**Goal**: The AI agent interprets natural language commands and maps them to appropriate MCP tool invocations with correct parameters, providing conversational responses.

**Independent Test**: Can be tested by sending natural language messages to the agent and verifying that: (1) the correct MCP tool is invoked, (2) parameters are extracted correctly, (3) the agent provides a human-friendly confirmation response.

### Implementation for User Story 2

- [X] T018 [P] [US2] Create OpenAI client module in backend/src/services/openai_client.py (AsyncOpenAI client initialization, SYSTEM_PROMPT with tool descriptions, timeout 30 seconds)
- [X] T019 [US2] Implement agent service in backend/src/services/agent_service.py (process_user_message function, calls OpenAI with conversation history, handles tool_calls, returns response and tool metadata)
- [X] T020 [US2] Create chat API endpoint in backend/src/api/chat.py (POST /api/{user_id}/chat, request body: message str and conversation_id UUID optional, response: conversation_id, response, tool_calls, timestamp)
- [X] T021 [US2] Integrate agent service with MCP tool registry (agent_service calls registry.execute_tool for each tool_call, handles tool execution errors, formats responses)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can send natural language messages and the agent will invoke the correct MCP tools.

---

## Phase 5: User Story 3 - Conversation State Management (Priority: P3)

**Goal**: The system maintains conversation history in the database, allowing stateless API design while preserving context across sessions for better user experience.

**Independent Test**: Can be tested by: (1) sending multiple messages in a conversation, (2) verifying messages are stored in the database with correct conversation_id, (3) restarting the session and verifying the agent can resume with full context.

### Implementation for User Story 3

- [X] T022 [P] [US3] Create conversation service in backend/src/services/conversation_service.py (get_or_create_conversation function, creates new conversation if conversation_id is None, validates conversation ownership)
- [X] T023 [P] [US3] Implement message persistence in backend/src/services/conversation_service.py (save_message function, stores user and assistant messages with role, content, tool_calls metadata)
- [X] T024 [US3] Implement conversation history loading in backend/src/services/conversation_service.py (get_conversation_history function, loads all messages for conversation_id ordered by created_at, formats for OpenAI API)
- [X] T025 [US3] Update chat endpoint to implement 7-step pipeline in backend/src/api/chat.py (1. receive message, 2. fetch history, 3. store user message, 4. run agent, 5. invoke tools, 6. store AI response, 7. return response)

**Checkpoint**: All user stories should now be independently functional. Conversations persist across sessions and the agent has full context.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T026 [P] Add comprehensive error handling across all services (database connection errors, OpenAI API errors, tool execution errors, return user-friendly messages)
- [X] T027 [P] Implement logging infrastructure (log all tool invocations with user_id, tool_name, parameters, result, execution time for audit trail)
- [X] T028 [P] Update documentation in specs/005-mcp-tools-agent/quickstart.md (verify all examples work, add troubleshooting section)
- [X] T029 Run quickstart.md validation (test all code examples, verify setup instructions, confirm API endpoints work as documented)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 MCP tools being complete (T011-T017)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US2 agent service being complete (T018-T021)

### Within Each User Story

- **User Story 1**: All MCP tools (T011-T015) can run in parallel, then T016 registry, then T017 formatter
- **User Story 2**: T018 OpenAI client can run in parallel with T019 agent service preparation, then T020 endpoint, then T021 integration
- **User Story 3**: T022 conversation service and T023 message persistence can run in parallel, then T024 history loading, then T025 pipeline integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003)
- All Foundational tasks marked [P] can run in parallel (T005, T006, T009, T010)
- All MCP tools in User Story 1 marked [P] can run in parallel (T011-T015, T017)
- OpenAI client and agent service prep in User Story 2 can run in parallel (T018)
- Conversation service and message persistence in User Story 3 can run in parallel (T022, T023)
- All Polish tasks marked [P] can run in parallel (T026, T027, T028)

---

## Parallel Example: User Story 1

```bash
# Launch all MCP tools together:
Task: "Create add_task MCP tool in backend/src/mcp/add_task.py"
Task: "Create list_tasks MCP tool in backend/src/mcp/list_tasks.py"
Task: "Create complete_task MCP tool in backend/src/mcp/complete_task.py"
Task: "Create delete_task MCP tool in backend/src/mcp/delete_task.py"
Task: "Create update_task MCP tool in backend/src/mcp/update_task.py"
Task: "Create response formatter utilities in backend/src/services/response_formatter.py"

# Then sequentially:
Task: "Create MCP tool registry in backend/src/mcp/registry.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T011-T017)
4. **STOP and VALIDATE**: Test User Story 1 independently by calling MCP tools directly
5. Deploy/demo if ready - you now have a programmatic task management API

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - Programmatic API)
3. Add User Story 2 → Test independently → Deploy/Demo (Conversational interface added)
4. Add User Story 3 → Test independently → Deploy/Demo (Context preservation added)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T010)
2. Once Foundational is done:
   - Developer A: User Story 1 (T011-T017) - MCP tools
   - Developer B: User Story 2 (T018-T021) - Agent (waits for US1 completion)
   - Developer C: User Story 3 (T022-T025) - Conversation state (waits for US2 completion)
3. Stories complete and integrate sequentially due to dependencies

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 2 depends on User Story 1 (needs MCP tools to invoke)
- User Story 3 depends on User Story 2 (needs agent service to integrate with)
- All tasks follow backend/src/ path structure from plan.md
- No test tasks included (not requested in specification)
- Total tasks: 29 (3 setup + 7 foundational + 7 US1 + 4 US2 + 4 US3 + 4 polish)
