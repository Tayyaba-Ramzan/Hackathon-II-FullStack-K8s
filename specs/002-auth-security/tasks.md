# Tasks: Authentication & Security – High-Level Todo App

**Input**: Design documents from `/specs/002-auth-security/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-api.yaml, quickstart.md

**Tests**: Tests are OPTIONAL per specification. Test tasks are NOT included in this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this project uses web application structure:
- Backend code: `backend/app/`
- Frontend code: `frontend/` (new directory)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency configuration

- [X] T001 Update backend/requirements.txt with authentication dependencies: PyJWT, passlib, python-jose, bcrypt
- [X] T002 [P] Update backend/.env.example with JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS variables
- [X] T003 [P] Initialize Next.js frontend project in frontend/ directory with TypeScript and TailwindCSS
- [X] T004 [P] Install frontend dependencies: better-auth, @better-auth/jwt, axios in frontend/package.json
- [X] T005 [P] Create backend/app/middleware/__init__.py (empty file for package)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Update backend/app/config.py to add JWT settings (jwt_secret, jwt_algorithm, jwt_expiration_hours)
- [X] T007 Update backend/app/models/user.py to add password_hash field (String, max 255 chars, required)
- [X] T008 [P] Create backend/app/utils/password.py with hash_password and verify_password functions using passlib/bcrypt
- [X] T009 [P] Create backend/app/utils/jwt_utils.py with create_access_token and verify_token functions using PyJWT
- [X] T010 Create backend/app/middleware/jwt_auth.py with get_current_user dependency for JWT validation
- [X] T011 [P] Update backend/app/schemas/user.py to add UserRegister, UserLogin, Token schemas with validation
- [X] T012 [P] Create frontend/lib/auth.ts with Better Auth configuration and JWT plugin
- [X] T013 [P] Create frontend/lib/api-client.ts with axios instance that attaches JWT to requests
- [X] T014 Create frontend/lib/auth-context.tsx with AuthProvider and useAuth hook for React state management

**Checkpoint**: Foundation ready - Authentication utilities and frontend context available, user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Implement registration and login endpoints on backend, create signup/signin pages on frontend, enable users to create accounts and authenticate

**Independent Test**: Register a new account via frontend signup page, login with credentials, receive JWT token, verify token is stored and attached to API requests

**Acceptance Criteria**:
- POST /auth/register creates user with hashed password
- POST /auth/login returns JWT token on valid credentials
- Frontend signup page validates input and calls register endpoint
- Frontend signin page validates input and calls login endpoint
- JWT token stored in browser and attached to subsequent requests
- Invalid credentials return 401 Unauthorized

### Implementation for User Story 1

- [X] T015 [P] [US1] Create backend/app/routers/auth.py with POST /auth/register endpoint (validate, hash password, create user)
- [X] T016 [US1] Add POST /auth/login endpoint to backend/app/routers/auth.py (verify password, generate JWT token)
- [X] T017 [US1] Register auth router in backend/app/main.py
- [X] T018 [US1] Add password strength validation to UserRegister schema (8+ chars, uppercase, lowercase, number)
- [X] T019 [US1] Add duplicate email/username checks in register endpoint (return 400 if exists)
- [X] T020 [P] [US1] Create frontend/app/(auth)/signup/page.tsx with signup form component
- [X] T021 [P] [US1] Create frontend/app/(auth)/signin/page.tsx with signin form component
- [X] T022 [US1] Implement register function in frontend/lib/auth-context.tsx (call /auth/register)
- [X] T023 [US1] Implement login function in frontend/lib/auth-context.tsx (call /auth/login, store token)
- [X] T024 [US1] Implement logout function in frontend/lib/auth-context.tsx (remove token from storage)
- [X] T025 [US1] Update frontend/app/layout.tsx to wrap app in AuthProvider
- [X] T026 [US1] Add error handling for registration failures (duplicate email/username, weak password)
- [X] T027 [US1] Add error handling for login failures (invalid credentials, 401 responses)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can register, login, and receive JWT tokens.

---

## Phase 4: User Story 2 - Protected API Access with User Isolation (Priority: P2)

**Goal**: Protect all task endpoints with JWT middleware, automatically filter data by authenticated user_id, enforce user isolation

**Independent Test**: Login as User A, create tasks, login as User B, verify User B cannot see User A's tasks. Verify unauthenticated requests return 401.

**Acceptance Criteria**:
- All task endpoints require valid JWT token
- Unauthenticated requests return 401 Unauthorized
- Tasks are automatically filtered by authenticated user_id
- Users cannot access other users' tasks (403 Forbidden)
- Task creation automatically sets user_id from JWT token

### Implementation for User Story 2

- [X] T028 [US2] Update backend/app/routers/tasks.py GET /tasks endpoint to require get_current_user dependency
- [X] T029 [US2] Add user_id filtering to GET /tasks query (filter by current_user.id)
- [X] T030 [US2] Update backend/app/routers/tasks.py POST /tasks endpoint to require get_current_user dependency
- [X] T031 [US2] Automatically set user_id from current_user.id in POST /tasks (ignore user_id from request body)
- [X] T032 [US2] Update backend/app/routers/tasks.py GET /tasks/{task_id} endpoint to require get_current_user dependency
- [X] T033 [US2] Add ownership validation to GET /tasks/{task_id} (return 403 if task.user_id != current_user.id)
- [X] T034 [US2] Update backend/app/routers/tasks.py PUT /tasks/{task_id} endpoint to require get_current_user dependency
- [X] T035 [US2] Add ownership validation to PUT /tasks/{task_id} (return 403 if task.user_id != current_user.id)
- [X] T036 [US2] Update backend/app/routers/tasks.py DELETE /tasks/{task_id} endpoint to require get_current_user dependency
- [X] T037 [US2] Add ownership validation to DELETE /tasks/{task_id} (return 403 if task.user_id != current_user.id)
- [X] T038 [US2] Update backend/app/routers/tasks.py PATCH /tasks/{task_id}/toggle endpoint to require get_current_user dependency
- [X] T039 [US2] Add ownership validation to PATCH /tasks/{task_id}/toggle (return 403 if task.user_id != current_user.id)
- [X] T040 [P] [US2] Update backend/app/routers/users.py endpoints to require get_current_user dependency (except register/login)
- [X] T041 [US2] Add CORS middleware to backend/app/main.py to allow frontend domain with credentials

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. All endpoints are protected and user isolation is enforced.

---

## Phase 5: User Story 3 - Secure Token Management (Priority: P3)

**Goal**: Implement token expiration validation, handle expired tokens gracefully, ensure tokens include proper claims

**Independent Test**: Login, wait for token expiration (or manually create expired token), verify API returns 401 with "Token expired" message. Verify invalid tokens are rejected.

**Acceptance Criteria**:
- JWT tokens include expiration time (exp claim)
- Expired tokens return 401 Unauthorized with "Token expired" message
- Invalid/malformed tokens return 401 Unauthorized with "Invalid token" message
- Token expiration time is configurable via environment variable
- Logout removes token from client storage

### Implementation for User Story 3

- [X] T042 [US3] Verify JWT token generation includes exp claim with configurable expiration time
- [X] T043 [US3] Add expiration validation to backend/app/utils/jwt_utils.py verify_token function
- [X] T044 [US3] Add specific error handling for ExpiredSignatureError in verify_token (return "Token expired")
- [X] T045 [US3] Add specific error handling for InvalidTokenError in verify_token (return "Invalid token")
- [X] T046 [US3] Verify get_current_user middleware returns 401 for missing Authorization header
- [X] T047 [US3] Test token expiration by setting short expiration time and verifying rejection
- [X] T048 [US3] Verify logout function in frontend removes token from localStorage

**Checkpoint**: All user stories should now be independently functional and validated. Token security is properly enforced.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T049 [P] Add API documentation strings (docstrings) to all auth endpoints in backend/app/routers/auth.py
- [X] T050 [P] Verify OpenAPI documentation at /docs includes auth endpoints with proper security schemes
- [X] T051 [P] Add logging for authentication failures in backend/app/routers/auth.py
- [X] T052 [P] Add logging for JWT validation failures in backend/app/middleware/jwt_auth.py
- [X] T053 Verify all error responses follow consistent JSON format ({"detail": "message"})
- [X] T054 Test password hashing performance (should be <200ms)
- [X] T055 Test JWT validation performance (should be <50ms overhead)
- [X] T056 Verify environment variables are loaded correctly from .env file
- [X] T057 Run through quickstart.md setup guide and verify all steps work
- [X] T058 [P] Update backend/README.md with authentication setup instructions
- [X] T059 [P] Create frontend/.env.example with NEXT_PUBLIC_API_URL variable
- [X] T060 Verify all HTTP status codes match specification (200, 201, 400, 401, 403, 422)
- [X] T061 Test user isolation scenario: User A cannot access User B's tasks
- [X] T062 Verify frontend redirects to signin page when unauthenticated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Depends on User Story 1 (needs auth endpoints and JWT tokens)
  - User Story 3 (Phase 5): Depends on User Story 1 and 2 (validates existing auth flow)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (needs JWT tokens from login to protect endpoints)
- **User Story 3 (P3)**: Depends on User Story 1 and 2 (validates token management in existing flow)

**Note**: Unlike Feature 001, these user stories have sequential dependencies because US2 requires JWT tokens from US1, and US3 validates the complete auth flow.

### Within Each User Story

- Backend utilities before endpoints
- Schemas before routers
- Middleware before protected endpoints
- Frontend context before UI components
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004, T005 can run in parallel (different files)
- **Phase 2 (Foundational)**: T008, T009, T011, T012, T013 can run in parallel (different files)
- **Phase 3 (US1)**: T015, T020, T021 can run in parallel (backend vs frontend)
- **Phase 6 (Polish)**: T049, T050, T051, T052, T058, T059 can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch backend and frontend tasks together:
Task: "Create backend/app/routers/auth.py with POST /auth/register endpoint"
Task: "Create frontend/app/(auth)/signup/page.tsx with signup form"
Task: "Create frontend/app/(auth)/signin/page.tsx with signin form"

# Then integrate sequentially:
Task: "Register auth router in backend/app/main.py"
Task: "Implement register function in frontend/lib/auth-context.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test registration and login independently
5. Deploy/demo if ready - you now have working authentication!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - Auth works!)
3. Add User Story 2 → Test independently → Deploy/Demo (User isolation enforced)
4. Add User Story 3 → Test independently → Deploy/Demo (Token security validated)
5. Each story adds security without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 backend (T015-T019)
   - Developer B: User Story 1 frontend (T020-T027)
3. After US1 complete:
   - Developer A: User Story 2 (T028-T041)
   - Developer B: User Story 3 (T042-T048)
4. Team completes Polish together (T049-T062)

---

## Task Summary

- **Total Tasks**: 62
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 9 tasks (core auth infrastructure)
- **User Story 1 (P1)**: 13 tasks (registration, login, frontend UI)
- **User Story 2 (P2)**: 14 tasks (protect endpoints, user isolation)
- **User Story 3 (P3)**: 7 tasks (token expiration, validation)
- **Polish Phase**: 14 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel with other tasks

**MVP Scope**: Phases 1-3 (27 tasks) deliver working authentication with registration and login

**Independent Test Criteria**:
- US1: Register account, login, receive JWT token, token stored in browser
- US2: Login as User A, create tasks, login as User B, verify isolation
- US3: Test expired token rejection, invalid token rejection, logout

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- User Story 2 depends on User Story 1 (needs JWT tokens)
- User Story 3 depends on User Story 1 and 2 (validates complete flow)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests are optional per specification - not included in this task list
- Verify all changes via Swagger UI at http://localhost:8000/docs
- Frontend runs on http://localhost:3000 (Next.js default)
