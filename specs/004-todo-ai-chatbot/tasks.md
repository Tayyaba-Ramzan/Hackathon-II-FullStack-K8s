# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/004-todo-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT requested in the feature specification, so test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow web application structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend project structure (backend/src/{models,services,api,mcp,db,auth})
- [x] T002 Create frontend project structure (frontend/src/{components,app,services,hooks})
- [x] T003 [P] Initialize Python backend with FastAPI dependencies in backend/requirements.txt
- [x] T004 [P] Initialize Next.js frontend with TypeScript and ChatKit UI in frontend/package.json
- [x] T005 [P] Configure environment variables template in backend/.env.example
- [x] T006 [P] Configure environment variables template in frontend/.env.local.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create database connection module in backend/src/db/connection.py
- [x] T008 Create Conversation model in backend/src/models/conversation.py
- [x] T009 Create Message model in backend/src/models/message.py
- [x] T010 Create database migration for conversations table in backend/src/db/migrations/002_create_conversations.py
- [x] T011 Create database migration for messages table in backend/src/db/migrations/003_create_messages.py
- [x] T012 [P] Implement add_task MCP tool in backend/src/mcp/add_task.py
- [x] T013 [P] Implement list_tasks MCP tool in backend/src/mcp/list_tasks.py
- [x] T014 [P] Implement complete_task MCP tool in backend/src/mcp/complete_task.py
- [x] T015 [P] Implement delete_task MCP tool in backend/src/mcp/delete_task.py
- [x] T016 [P] Implement update_task MCP tool in backend/src/mcp/update_task.py
- [x] T017 Create MCP tool registry in backend/src/mcp/registry.py
- [x] T018 Create OpenAI Agents SDK client in backend/src/services/openai_client.py
- [x] T019 Create authentication middleware in backend/src/auth/middleware.py
- [x] T020 Create user_id extraction utility in backend/src/auth/utils.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Natural Language Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can manage tasks through natural language commands in a conversational interface

**Independent Test**: Send messages like "add a task to buy groceries" or "show me my tasks" and verify AI correctly interprets and executes operations

### Implementation for User Story 1

- [x] T021 [P] [US1] Create agent service with system prompt in backend/src/services/agent_service.py
- [x] T022 [P] [US1] Create conversation service for message persistence in backend/src/services/conversation_service.py
- [x] T023 [US1] Implement chat API endpoint POST /api/{user_id}/chat in backend/src/api/chat.py
- [x] T024 [US1] Implement 7-step conversation flow in chat endpoint (receive → fetch → store → agent → tools → store → respond)
- [x] T025 [US1] Add error handling and validation to chat endpoint in backend/src/api/chat.py
- [x] T026 [P] [US1] Create ChatInterface component in frontend/src/components/ChatInterface.tsx
- [x] T027 [P] [US1] Create MessageList component in frontend/src/components/MessageList.tsx
- [x] T028 [P] [US1] Create InputBox component in frontend/src/components/InputBox.tsx
- [x] T029 [US1] Create API client service in frontend/src/services/api-client.ts
- [x] T030 [US1] Create chat page in frontend/src/app/chat/page.tsx
- [x] T031 [US1] Implement useChatState hook in frontend/src/hooks/useChatState.ts
- [x] T032 [US1] Add loading states and error handling to ChatInterface component

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can manage tasks via natural language

---

## Phase 4: User Story 2 - Conversation Continuity (Priority: P2)

**Goal**: Users can have ongoing conversations that maintain context across messages and sessions

**Independent Test**: Start a conversation, close browser, reopen, and verify conversation history is restored and AI remembers context

### Implementation for User Story 2

- [x] T033 [P] [US2] Create conversation list service in backend/src/services/conversation_list_service.py
- [x] T034 [P] [US2] Implement GET /api/{user_id}/conversations endpoint in backend/src/api/conversations.py
- [x] T035 [P] [US2] Implement GET /api/{user_id}/conversations/{conversation_id}/messages endpoint in backend/src/api/conversations.py
- [x] T036 [US2] Add conversation_id handling to chat endpoint for continuing conversations
- [x] T037 [P] [US2] Create ConversationList component in frontend/src/components/ConversationList.tsx
- [x] T038 [P] [US2] Create ConversationItem component in frontend/src/components/ConversationItem.tsx
- [x] T039 [US2] Implement useConversations hook in frontend/src/hooks/useConversations.ts
- [x] T040 [US2] Add conversation switching logic to chat page in frontend/src/app/chat/page.tsx
- [x] T041 [US2] Implement conversation history loading in ChatInterface component
- [x] T042 [US2] Add new conversation button and logic to frontend

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can manage tasks and maintain conversation history

---

## Phase 5: User Story 3 - Intelligent Response Generation (Priority: P3)

**Goal**: AI provides helpful, contextually appropriate responses that guide users and confirm actions

**Independent Test**: Send various message types (questions, commands, ambiguous requests) and evaluate response quality and helpfulness

### Implementation for User Story 3

- [x] T043 [P] [US3] Enhance system prompt with clarification strategies in backend/src/services/agent_service.py
- [x] T044 [P] [US3] Add ambiguity detection logic to agent service in backend/src/services/agent_service.py
- [x] T045 [P] [US3] Implement error message formatting in backend/src/services/response_formatter.py
- [x] T046 [US3] Add response quality validation in agent service
- [x] T047 [US3] Implement greeting and casual message handling in agent service
- [x] T048 [P] [US3] Create ErrorMessage component in frontend/src/components/ErrorMessage.tsx
- [x] T049 [P] [US3] Create TypingIndicator component in frontend/src/components/TypingIndicator.tsx
- [x] T050 [US3] Add response formatting and styling to MessageList component
- [x] T051 [US3] Implement retry logic for failed messages in frontend

**Checkpoint**: All user stories should now be independently functional with high-quality AI responses

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T052 [P] Add rate limiting middleware in backend/src/api/rate_limiter.py
- [x] T053 [P] Implement logging infrastructure in backend/src/services/logger.py
- [x] T054 [P] Add request/response logging to chat endpoint
- [x] T055 [P] Implement database connection pooling configuration in backend/src/db/connection.py
- [x] T056 [P] Add CORS configuration to FastAPI app in backend/src/main.py
- [x] T057 [P] Create API documentation with OpenAPI in backend/src/main.py
- [x] T058 [P] Add frontend error boundary in frontend/src/components/ErrorBoundary.tsx
- [x] T059 [P] Implement responsive design for mobile in frontend/src/components/ChatInterface.tsx
- [x] T060 [P] Add accessibility attributes (ARIA labels) to chat components
- [x] T061 Run quickstart.md validation to verify setup instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1/US2 but independently testable

### Within Each User Story

- Backend services before API endpoints
- API endpoints before frontend components
- Frontend components before page integration
- Core implementation before error handling

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational MCP tool tasks (T012-T016) can run in parallel
- Within User Story 1: T021-T022 (backend services), T026-T028 (frontend components) can run in parallel
- Within User Story 2: T033-T035 (backend), T037-T038 (frontend components) can run in parallel
- Within User Story 3: T043-T045 (backend), T048-T049 (frontend components) can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch backend services together:
Task: "Create agent service with system prompt in backend/src/services/agent_service.py"
Task: "Create conversation service for message persistence in backend/src/services/conversation_service.py"

# Launch frontend components together:
Task: "Create ChatInterface component in frontend/src/components/ChatInterface.tsx"
Task: "Create MessageList component in frontend/src/components/MessageList.tsx"
Task: "Create InputBox component in frontend/src/components/InputBox.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend)
   - Developer B: User Story 1 (frontend)
   - After US1 complete, split US2 and US3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- User and Task models already exist from Phase II (no need to recreate)
- Conversation and Message models are new for Phase III
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
