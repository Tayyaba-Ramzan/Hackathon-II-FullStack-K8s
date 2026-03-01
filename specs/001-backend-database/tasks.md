# Tasks: Backend & Database – High-Level Todo App

**Input**: Design documents from `/specs/001-backend-database/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Tests are OPTIONAL per specification ("Unit tests optional but recommended"). Test tasks are NOT included in this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this project uses web application structure:
- Backend code: `backend/app/`
- Tests (optional): `backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure per plan.md (backend/app/ with subdirectories)
- [X] T002 Create requirements.txt with dependencies: fastapi, sqlmodel, pydantic, psycopg2-binary, uvicorn, python-dotenv, pydantic-settings
- [X] T003 [P] Create .env.example file with DATABASE_URL, HOST, PORT variables
- [X] T004 [P] Create backend/app/__init__.py (empty file for package)
- [X] T005 [P] Create README.md with project overview and setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create backend/app/config.py with Settings class using pydantic-settings for environment variables
- [X] T007 Create backend/app/database.py with SQLModel engine, session factory, and get_session dependency
- [X] T008 [P] Create backend/app/models/__init__.py (empty file for package)
- [X] T009 [P] Create backend/app/schemas/__init__.py (empty file for package)
- [X] T010 [P] Create backend/app/routers/__init__.py (empty file for package)
- [X] T011 [P] Create backend/app/utils/__init__.py (empty file for package)
- [X] T012 [P] Create User model in backend/app/models/user.py with fields: id, email, username, created_at
- [X] T013 [P] Create User schemas in backend/app/schemas/user.py (UserCreate, UserRead)
- [X] T014 Create User router in backend/app/routers/users.py with POST /users, GET /users, GET /users/{user_id} endpoints
- [X] T015 Create backend/app/main.py with FastAPI app initialization, CORS middleware, router registration, and startup event for table creation
- [X] T016 [P] Create backend/app/utils/error_handlers.py with custom exception handlers for 404, 400, 422, 500, 503 errors

**Checkpoint**: Foundation ready - User API functional, database connected, user story implementation can now begin

---

## Phase 3: User Story 1 - Create and Manage Tasks (Priority: P1) 🎯 MVP

**Goal**: Implement full CRUD operations for tasks (create, read, update, delete) so API consumers can manage todo items

**Independent Test**: Make HTTP requests to task endpoints (POST, GET, PUT, DELETE) and verify responses match expected schemas and status codes. Create a user first via POST /users, then create/manage tasks for that user.

**Acceptance Criteria**:
- POST /tasks creates task with 201 status
- GET /tasks returns all tasks with 200 status
- GET /tasks/{id} returns specific task with 200 status
- PUT /tasks/{id} updates task with 200 status
- DELETE /tasks/{id} deletes task with 204 status
- All endpoints validate input and return proper error codes (400, 404, 422)

### Implementation for User Story 1

- [X] T017 [P] [US1] Create Task model in backend/app/models/task.py with fields: id, title, description, is_completed, user_id, created_at, updated_at
- [X] T018 [P] [US1] Create Task schemas in backend/app/schemas/task.py (TaskCreate, TaskRead, TaskUpdate)
- [X] T019 [US1] Create Task router in backend/app/routers/tasks.py with POST /tasks endpoint (create task)
- [X] T020 [US1] Add GET /tasks endpoint to backend/app/routers/tasks.py (list all tasks)
- [X] T021 [US1] Add GET /tasks/{task_id} endpoint to backend/app/routers/tasks.py (get single task)
- [X] T022 [US1] Add PUT /tasks/{task_id} endpoint to backend/app/routers/tasks.py (update task)
- [X] T023 [US1] Add DELETE /tasks/{task_id} endpoint to backend/app/routers/tasks.py (delete task)
- [X] T024 [US1] Register tasks router in backend/app/main.py
- [X] T025 [US1] Add validation for user_id existence in POST /tasks endpoint (return 400 if user not found)
- [X] T026 [US1] Add error handling for 404 Not Found in GET, PUT, DELETE endpoints

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Test via Swagger UI at /docs or cURL commands.

---

## Phase 4: User Story 2 - Toggle Task Completion Status (Priority: P2)

**Goal**: Implement dedicated endpoint to toggle task completion status with a single operation for better UX and performance

**Independent Test**: Create a task via POST /tasks, call PATCH /tasks/{id}/toggle, and verify is_completed flips from false to true (or vice versa). Repeat to verify it toggles back.

**Acceptance Criteria**:
- PATCH /tasks/{id}/toggle flips is_completed from false to true
- PATCH /tasks/{id}/toggle flips is_completed from true to false
- Returns 200 status with updated task
- Returns 404 if task not found

### Implementation for User Story 2

- [X] T027 [US2] Add PATCH /tasks/{task_id}/toggle endpoint to backend/app/routers/tasks.py
- [X] T028 [US2] Implement toggle logic: read current is_completed value, flip it, save, return updated task
- [X] T029 [US2] Add error handling for 404 Not Found in toggle endpoint
- [X] T030 [US2] Update updated_at timestamp when toggling completion status

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Test toggle functionality via Swagger UI or cURL.

---

## Phase 5: User Story 3 - User Data Management (Priority: P3)

**Goal**: Validate and document user management endpoints (already implemented in Foundational phase)

**Independent Test**: Create users via POST /users and retrieve them via GET /users and GET /users/{id}. Verify all endpoints return proper status codes and data.

**Note**: User model and all user endpoints were implemented in Phase 2 (Foundational) as they are blocking prerequisites for task management. This phase focuses on validation and documentation.

### Validation for User Story 3

- [X] T031 [US3] Verify POST /users endpoint validates email format (422 for invalid email)
- [X] T032 [US3] Verify POST /users endpoint enforces unique email constraint (400 for duplicate)
- [X] T033 [US3] Verify POST /users endpoint enforces unique username constraint (400 for duplicate)
- [X] T034 [US3] Verify GET /users endpoint returns all users with 200 status
- [X] T035 [US3] Verify GET /users/{user_id} endpoint returns 404 for non-existent user
- [X] T036 [US3] Add username validation in backend/app/schemas/user.py (3-50 chars, alphanumeric + underscores)

**Checkpoint**: All user stories should now be independently functional and validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T037 [P] Add API documentation strings (docstrings) to all endpoint functions in backend/app/routers/
- [X] T038 [P] Verify OpenAPI documentation at /docs includes all 8 endpoints with proper schemas
- [X] T039 [P] Add logging for database connection errors in backend/app/database.py
- [X] T040 [P] Add logging for endpoint errors in backend/app/utils/error_handlers.py
- [X] T041 Validate all endpoints return consistent error format per FR-017
- [X] T042 Test database connection pooling under concurrent requests (manual testing)
- [X] T043 Verify environment variables are loaded correctly from .env file
- [X] T044 Run through quickstart.md setup guide and verify all steps work
- [X] T045 [P] Update README.md with API endpoint documentation and example requests
- [X] T046 Verify all HTTP status codes match specification (200, 201, 204, 400, 404, 422, 500, 503)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - Extends US1 but independently testable
  - User Story 3 (Phase 5): Validation only (implementation in Foundational)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P3)**: Already implemented in Foundational - Validation phase only

**Note on Priorities**: While US1 is P1 (highest business priority), US3 (User management) was implemented in Foundational phase because it's a technical prerequisite for US1 (tasks need users to exist). This allows US1 to be independently testable.

### Within Each User Story

- Models before schemas
- Schemas before routers
- Core endpoints before error handling
- Implementation before validation
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T003, T004, T005 can run in parallel
- **Phase 2 (Foundational)**: T008-T013, T016 can run in parallel (different files)
- **Phase 3 (US1)**: T017, T018 can run in parallel (different files)
- **Phase 6 (Polish)**: T037, T038, T039, T040, T045 can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch model and schema creation together:
Task: "Create Task model in backend/app/models/task.py"
Task: "Create Task schemas in backend/app/schemas/task.py"

# Then implement endpoints sequentially (same file):
Task: "Create Task router with POST /tasks endpoint"
Task: "Add GET /tasks endpoint"
Task: "Add GET /tasks/{task_id} endpoint"
# ... etc
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T016) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T017-T026)
4. **STOP and VALIDATE**: Test User Story 1 independently via Swagger UI
5. Deploy/demo if ready - you now have a functional task management API!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (User API works)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - Task CRUD works!)
3. Add User Story 2 → Test independently → Deploy/Demo (Toggle feature added)
4. Add User Story 3 validation → Test independently → Deploy/Demo (All features validated)
5. Add Polish → Final validation → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational is done:
   - Developer A: User Story 1 (T017-T026)
   - Developer B: User Story 2 (T027-T030) - can start in parallel
   - Developer C: User Story 3 validation (T031-T036) - can start in parallel
3. Stories complete and integrate independently
4. Team completes Polish together (T037-T046)

---

## Task Summary

- **Total Tasks**: 46
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 11 tasks (includes User implementation)
- **User Story 1 (P1)**: 10 tasks
- **User Story 2 (P2)**: 4 tasks
- **User Story 3 (P3)**: 6 tasks (validation only)
- **Polish Phase**: 10 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel with other tasks

**MVP Scope**: Phases 1-3 (26 tasks) deliver a functional task management API

**Independent Test Criteria**:
- US1: Create user, create/read/update/delete tasks via API, verify responses
- US2: Create task, toggle completion status, verify it flips correctly
- US3: Create users, retrieve users, verify validation and constraints

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User endpoints implemented in Foundational phase to enable US1 independent testing
- Tests are optional per specification - not included in this task list
- Verify all changes via Swagger UI at http://localhost:8000/docs
