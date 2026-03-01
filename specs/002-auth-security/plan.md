# Implementation Plan: Authentication & Security – High-Level Todo App

**Branch**: `002-auth-security` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-auth-security/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement secure JWT-based authentication with Better Auth on the frontend and FastAPI JWT middleware on the backend. Add password hashing to the User model, create registration and login endpoints, and enforce user isolation by extracting user_id from JWT tokens and filtering all data access. The system will be stateless with no server-side session storage, using a shared JWT secret for token signing and verification.

## Technical Context

**Language/Version**: Python 3.9+ (backend), TypeScript/JavaScript (frontend with Next.js 16+)
**Primary Dependencies**:
- Backend: FastAPI, PyJWT, passlib (bcrypt), python-jose
- Frontend: Better Auth, @better-auth/jwt, Next.js 16+, React
**Storage**: Neon PostgreSQL (extends existing User model with password_hash field)
**Testing**: pytest for backend (optional), Jest/React Testing Library for frontend (optional)
**Target Platform**: Web application (backend API + frontend SPA)
**Project Type**: Web application (full-stack)
**Performance Goals**: JWT validation <50ms overhead per request, password hashing <200ms
**Constraints**: Stateless architecture, shared JWT secret via environment variable, 1-hour token expiration
**Scale/Scope**: Multi-user authentication, 2 new backend endpoints (register, login), 2 frontend pages (signup, signin), JWT middleware for all protected endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Security First
- Password hashing with bcrypt (FR-002)
- JWT tokens with expiration (FR-017)
- User isolation enforced at API layer (FR-006, FR-010)
- Shared secret from environment variables (FR-011)
- No secrets in version control
- 401/403 error responses for security violations (FR-007, FR-008)

### ✅ Spec-Driven Development
- Following spec → plan → tasks → implement workflow
- All requirements from spec.md will be addressed
- Architecture decisions will be documented

### ✅ Reproducibility
- Clear dependency declaration (requirements.txt, package.json)
- Environment variable documentation (JWT_SECRET)
- Database migration for password_hash field
- Setup instructions in quickstart.md

### ✅ Scalability & Modularity
- Stateless JWT architecture (no server-side sessions)
- Reusable JWT middleware for all protected endpoints
- Modular auth components (registration, login, middleware)
- Clean separation: frontend auth UI, backend auth logic

### ✅ Rigor & Quality
- Password strength validation (FR-012)
- JWT signature validation (FR-018)
- Consistent error response format (FR-019)
- Proper HTTP status codes (401, 403)
- Optional: Unit tests for auth logic

### Constitution Compliance Summary
All constitution principles are satisfied by the planned architecture. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-security/
├── spec.md              # Feature specification
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── auth-api.yaml    # Authentication API contract
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py              # Update: Add auth router registration
│   ├── config.py            # Update: Add JWT_SECRET, JWT_EXPIRATION
│   ├── database.py          # No changes needed
│   ├── models/
│   │   ├── user.py          # Update: Add password_hash field
│   │   └── task.py          # No changes needed
│   ├── schemas/
│   │   ├── user.py          # Update: Add UserRegister, UserLogin, Token schemas
│   │   └── task.py          # No changes needed
│   ├── routers/
│   │   ├── auth.py          # NEW: Registration and login endpoints
│   │   ├── users.py         # Update: Protect with JWT middleware
│   │   └── tasks.py         # Update: Protect with JWT middleware, filter by user_id
│   ├── middleware/          # NEW directory
│   │   ├── __init__.py
│   │   └── jwt_auth.py      # NEW: JWT validation middleware
│   └── utils/
│       ├── password.py      # NEW: Password hashing utilities
│       └── jwt_utils.py     # NEW: JWT token generation/validation
├── requirements.txt         # Update: Add PyJWT, passlib, python-jose
└── .env.example             # Update: Add JWT_SECRET, JWT_EXPIRATION

frontend/                    # NEW directory
├── app/
│   ├── (auth)/              # NEW: Auth route group
│   │   ├── signin/
│   │   │   └── page.tsx     # NEW: Sign in page
│   │   └── signup/
│   │       └── page.tsx     # NEW: Sign up page
│   ├── layout.tsx           # Update: Add auth provider
│   └── page.tsx             # Update: Redirect if not authenticated
├── lib/
│   ├── auth.ts              # NEW: Better Auth configuration
│   ├── api-client.ts        # NEW: API client with JWT attachment
│   └── auth-context.tsx     # NEW: Auth context provider
├── components/
│   ├── auth/                # NEW directory
│   │   ├── SignInForm.tsx   # NEW: Sign in form component
│   │   └── SignUpForm.tsx   # NEW: Sign up form component
│   └── ui/                  # Existing UI components
├── package.json             # NEW: Dependencies (better-auth, etc.)
├── tsconfig.json            # NEW: TypeScript configuration
└── next.config.js           # NEW: Next.js configuration
```

**Structure Decision**: Selected web application structure with both backend and frontend. Backend extends existing FastAPI structure from Feature 001. Frontend is new Next.js 16+ application with App Router. Authentication logic is split: backend handles JWT generation/validation, frontend handles UI and token storage.

## Complexity Tracking

No constitution violations. All complexity is justified by functional requirements and follows established patterns.
