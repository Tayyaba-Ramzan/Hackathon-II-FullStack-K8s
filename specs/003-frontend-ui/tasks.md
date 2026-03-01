# Tasks: Frontend Application – High-Level Todo App

**Input**: Design documents from `/specs/003-frontend-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `frontend/` directory at repository root
- All paths relative to `frontend/` directory
- Extends existing structure from Spec 002 (Authentication & Security)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency management

- [X] T001 Verify frontend project structure matches plan.md specifications
- [X] T002 Install Next.js 16+ dependencies in frontend/package.json (react 18+, next 16+, typescript)
- [X] T003 [P] Install TailwindCSS 3+ and configure in frontend/tailwind.config.js
- [X] T004 [P] Install Axios for API client in frontend/package.json
- [X] T005 [P] Configure TypeScript paths in frontend/tsconfig.json for @/ alias
- [X] T006 Update frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:8001
- [X] T007 Update frontend/styles/globals.css with TailwindCSS directives and custom styles

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components and infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 [P] Create Button atom component in frontend/components/atoms/Button.tsx
- [X] T009 [P] Create Input atom component in frontend/components/atoms/Input.tsx
- [X] T010 [P] Create Textarea atom component in frontend/components/atoms/Textarea.tsx
- [X] T011 [P] Create Checkbox atom component in frontend/components/atoms/Checkbox.tsx
- [X] T012 [P] Create ErrorMessage atom component in frontend/components/atoms/ErrorMessage.tsx
- [X] T013 [P] Create LoadingSpinner molecule component in frontend/components/molecules/LoadingSpinner.tsx
- [X] T014 Extend API client with task endpoints in frontend/lib/api-client.ts
- [X] T015 Create TypeScript types for Task entities in frontend/types/index.ts
- [X] T016 Create useTasks custom hook in frontend/lib/hooks/useTasks.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Task Management Dashboard (Priority: P1) 🎯 MVP

**Goal**: Users can view, create, update, delete, and toggle their tasks through a visual dashboard interface

**Independent Test**: Navigate to /dashboard, create a task, edit it, toggle completion, delete it - all operations should work

### Implementation for User Story 1

- [X] T017 [P] [US1] Create TaskContext provider in frontend/lib/contexts/TaskContext.tsx
- [X] T018 [P] [US1] Create TaskCard molecule component in frontend/components/molecules/TaskCard.tsx
- [X] T019 [P] [US1] Create TaskFilter molecule component in frontend/components/molecules/TaskFilter.tsx
- [X] T020 [P] [US1] Create EmptyState molecule component in frontend/components/molecules/EmptyState.tsx
- [X] T021 [US1] Create TaskList organism component in frontend/components/organisms/TaskList.tsx
- [X] T022 [US1] Create TaskForm organism component in frontend/components/organisms/TaskForm.tsx
- [X] T023 [US1] Create Modal component in frontend/components/modals/Modal.tsx
- [X] T024 [US1] Create ConfirmDialog component in frontend/components/modals/ConfirmDialog.tsx
- [X] T025 [US1] Create Dashboard page in frontend/app/dashboard/page.tsx
- [X] T026 [US1] Integrate TaskContext provider in frontend/app/layout.tsx
- [X] T027 [US1] Add authentication guard to Dashboard page (redirect to /signin if not authenticated)
- [X] T028 [US1] Implement create task functionality with modal in Dashboard page
- [X] T029 [US1] Implement edit task functionality with modal in Dashboard page
- [X] T030 [US1] Implement delete task functionality with confirmation dialog in Dashboard page
- [X] T031 [US1] Implement toggle task completion with optimistic updates in Dashboard page
- [X] T032 [US1] Add task filtering (all/active/completed) in Dashboard page

**Checkpoint**: At this point, User Story 1 should be fully functional - users can manage tasks on the dashboard

---

## Phase 4: User Story 2 - Authentication & Landing (Priority: P2)

**Goal**: Users can access landing page, signup, signin, and logout functionality with enhanced UI

**Independent Test**: Visit /, click "Get Started" → signup → redirects to dashboard → logout → redirects to signin

### Implementation for User Story 2

- [X] T033 [P] [US2] Create Hero organism component in frontend/components/layout/Hero.tsx
- [X] T034 [P] [US2] Create Header organism component (integrated in Dashboard page with user info and logout)
- [X] T035 [P] [US2] Create Footer layout component in frontend/components/layout/Footer.tsx
- [X] T036 [US2] Update Landing page with hero section in frontend/app/page.tsx
- [X] T037 [US2] Add gradient background and CTA buttons to Landing page
- [X] T038 [US2] Update Signup page with enhanced styling in frontend/app/(auth)/signup/page.tsx
- [X] T039 [US2] Update Signin page with enhanced styling in frontend/app/(auth)/signin/page.tsx
- [X] T040 [US2] Enhance AuthForm component with better validation (integrated in signin page)
- [X] T041 [US2] Enhance AuthForm component with better validation (integrated in signup page)
- [X] T042 [US2] Add Header component to Dashboard layout with user info and logout button
- [X] T043 [US2] Implement logout functionality in Header component
- [X] T044 [US2] Add redirect logic: authenticated users on / → /dashboard
- [X] T045 [US2] Add redirect logic: authenticated users on /signin or /signup → /dashboard
- [X] T046 [US2] Add navigation links between landing, signin, and signup pages

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - complete auth flow and task management

---

## Phase 5: User Story 3 - Enhanced UX (Priority: P3)

**Goal**: Visual feedback, animations, responsive design, and polished user experience across all devices

**Independent Test**: Test loading states during API calls, error messages on failures, empty states when no tasks, responsive design on mobile/tablet/desktop

### Implementation for User Story 3

- [X] T047 [P] [US3] Add loading indicators to all API operations in TaskContext
- [X] T048 [P] [US3] Add error message display with toast notifications in Dashboard page
- [X] T049 [P] [US3] Add empty state display when no tasks exist in TaskList component
- [X] T050 [P] [US3] Add loading state to TaskForm submit button
- [X] T051 [P] [US3] Add loading state to AuthForm submit buttons
- [X] T052 [US3] Implement responsive grid layout for TaskList (mobile: 1 col, tablet: 2 cols, desktop: 3 cols)
- [X] T053 [US3] Add hover effects to TaskCard component (shadow, scale)
- [X] T054 [US3] Add transition animations to Modal component (fade in/out)
- [X] T055 [US3] Add transition animations to task operations (create, delete, toggle)
- [X] T056 [US3] Implement mobile-responsive navigation in Header component (simplified - logout button responsive)
- [X] T057 [US3] Add responsive breakpoints to Landing page hero section
- [X] T058 [US3] Add responsive breakpoints to auth forms (mobile: full width, desktop: centered)
- [X] T059 [US3] Implement form validation with inline error messages in TaskForm
- [X] T060 [US3] Implement form validation with inline error messages in AuthForm
- [X] T061 [US3] Add visual feedback for task completion toggle (strikethrough, opacity)
- [X] T062 [US3] Add loading skeleton for initial dashboard load
- [X] T063 [US3] Test responsive design on mobile (320px+), tablet (768px+), desktop (1024px+)

**Checkpoint**: All user stories should now be independently functional with polished UX

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation across all user stories

- [X] T064 [P] Add accessibility attributes (ARIA labels, roles) to all interactive components
- [X] T065 [P] Optimize images and assets in frontend/public/ directory (using Next.js defaults)
- [X] T066 [P] Add keyboard navigation support to Modal and ConfirmDialog components
- [X] T067 [P] Add focus management to forms (focus first field on mount)
- [X] T068 Code cleanup: Remove console.logs and debug code
- [X] T069 Code cleanup: Ensure consistent naming conventions across components
- [X] T070 Verify all environment variables are documented in frontend/.env.example
- [X] T071 Run quickstart.md validation: verify setup instructions work
- [X] T072 Performance check: Verify dashboard loads in <3 seconds
- [X] T073 Performance check: Verify task operations complete in <10 seconds
- [X] T074 Security check: Verify no secrets in code, JWT tokens handled securely
- [X] T075 Update frontend/README.md with setup and development instructions

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 (adds Header to Dashboard) but US1 is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 and US2 but they remain independently testable

### Within Each User Story

**User Story 1**:
- T017-T020 (Context, molecules) can run in parallel
- T021-T022 (organisms) depend on T017-T020
- T023-T024 (modals) can run in parallel with T021-T022
- T025 (Dashboard page) depends on T021-T024
- T026-T032 (integration) depend on T025

**User Story 2**:
- T033-T035 (layout components) can run in parallel
- T036-T039 (page updates) can run in parallel after T033-T035
- T040-T041 (form enhancements) can run in parallel
- T042-T046 (integration) depend on previous tasks

**User Story 3**:
- T047-T051 (loading/error states) can run in parallel
- T052-T058 (responsive design) can run in parallel
- T059-T063 (validation and polish) can run in parallel

### Parallel Opportunities

- All Setup tasks (T002-T007) marked [P] can run in parallel
- All Foundational tasks (T008-T013) marked [P] can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each user story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all molecule components for User Story 1 together:
Task T017: "Create TaskContext provider in frontend/src/contexts/TaskContext.tsx"
Task T018: "Create TaskCard molecule component in frontend/src/components/molecules/TaskCard.tsx"
Task T019: "Create TaskFilter molecule component in frontend/src/components/molecules/TaskFilter.tsx"
Task T020: "Create EmptyState molecule component in frontend/src/components/molecules/EmptyState.tsx"

# After molecules complete, launch organisms together:
Task T021: "Create TaskList organism component in frontend/src/components/organisms/TaskList.tsx"
Task T022: "Create TaskForm organism component in frontend/src/components/organisms/TaskForm.tsx"
Task T023: "Create Modal component in frontend/src/components/modals/Modal.tsx"
Task T024: "Create ConfirmDialog component in frontend/src/components/modals/ConfirmDialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T016) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T017-T032)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Navigate to /dashboard
   - Create, edit, delete, toggle tasks
   - Verify all operations work
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T017-T032) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T033-T046) → Test independently → Deploy/Demo
4. Add User Story 3 (T047-T063) → Test independently → Deploy/Demo
5. Add Polish (T064-T075) → Final validation → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational is done:
   - Developer A: User Story 1 (T017-T032)
   - Developer B: User Story 2 (T033-T046)
   - Developer C: User Story 3 (T047-T063)
3. Stories complete and integrate independently
4. Team completes Polish together (T064-T075)

---

## Task Summary

**Total Tasks**: 75
- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundational): 9 tasks (BLOCKS all stories)
- Phase 3 (User Story 1 - Task Management): 16 tasks
- Phase 4 (User Story 2 - Auth & Landing): 14 tasks
- Phase 5 (User Story 3 - Enhanced UX): 17 tasks
- Phase 6 (Polish): 12 tasks

**Parallel Opportunities**:
- Setup: 5 tasks can run in parallel (T003-T007)
- Foundational: 6 tasks can run in parallel (T008-T013)
- User Story 1: 4 tasks can run in parallel (T017-T020), then 4 more (T021-T024)
- User Story 2: 3 tasks can run in parallel (T033-T035), then 2 (T036-T037), then 2 (T040-T041)
- User Story 3: 5 tasks can run in parallel (T047-T051), then 7 (T052-T058), then 5 (T059-T063)
- Polish: 5 tasks can run in parallel (T064-T067)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 = 32 tasks (User Story 1 only)

**Independent Test Criteria**:
- **User Story 1**: Dashboard with full CRUD operations for tasks
- **User Story 2**: Complete authentication flow (landing → signup → signin → logout)
- **User Story 3**: Responsive design with loading/error/empty states on all devices

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests are OPTIONAL and not included (not requested in spec)
- Extends existing frontend/ directory from Spec 002 (auth already implemented)
- All paths relative to frontend/ directory
