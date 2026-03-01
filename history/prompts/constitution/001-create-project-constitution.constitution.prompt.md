---
id: 001
title: Create project constitution
stage: constitution
date: 2026-02-23
surface: agent
model: claude-sonnet-4-6
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "project-setup", "principles", "standards"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

/sp.constitution

Project: High-Level Todo Full-Stack Web Application with Modern UI/UX

Core principles:
- Security: JWT-based authentication, user isolation, XSS prevention
- UI/UX: Modern, responsive, accessible, visually appealing
- Spec-Driven: All features modular and fully documented
- Reproducibility: Backend, database, and frontend fully traceable
- Scalability: Modular components, reusable, easy to extend
- Rigor: All endpoints validated and tested
- Optional Extras: Animations, hover effects, modal dialogs, gradient hero sections

Key standards:
- REST API fully documented and validated
- Frontend: Next.js 16+ App Router
- Styling: TailwindCSS or modern CSS-in-JS
- Database: Neon Serverless PostgreSQL with SQLModel
- Authentication: Better Auth with JWT
- Unit & Integration tests recommended
- CI/CD ready

Constraints:
- Implementation via Claude Code only, no manual coding
- Environment variables for secrets & DB
- Secure API token handling
- Tasks include full CRUD + toggle completion + enhanced UI states
- Deployment-ready architecture

Success criteria:
- Fully functional multi-user Todo App
- Secure authentication and user isolation
- Responsive, modern, visually appealing frontend
- Backend fully integrated with database
- Clean, modular, scalable codebase
- Optional enhancements: animations, hover states, better UX

## Response snapshot

Created comprehensive project constitution at `.specify/memory/constitution.md` with the following structure:

**Core Principles (6):**
1. Security First - JWT auth, user isolation, XSS prevention, secure secrets management
2. UI/UX Excellence - Modern, responsive, accessible design with clear user feedback
3. Spec-Driven Development (NON-NEGOTIABLE) - Full documentation before implementation
4. Reproducibility - Traceable backend, database, and frontend with clear setup docs
5. Scalability & Modularity - Reusable components, clean separation of concerns
6. Rigor & Quality - Validated endpoints, type safety, comprehensive error handling

**Key Standards:**
- Backend: FastAPI + Neon PostgreSQL + SQLModel + Better Auth
- Frontend: Next.js 16+ App Router + TailwindCSS + TypeScript
- Database: User isolation enforced, migrations tracked, optimized indexes
- Testing: Unit, integration, component, and E2E tests
- CI/CD: Environment-based config, automated testing, zero-downtime deployment

**Constraints:**
- Implementation via Claude Code agents only
- Security: No secrets in version control, proper password hashing
- Features: Full CRUD, toggle completion, user auth, enhanced UI states
- Architecture: Clean separation, API-first, stateless backend

**Success Criteria:**
- Functional multi-user Todo app with secure auth
- User isolation at API and DB levels
- Responsive, accessible, modern UI
- Clean, modular, scalable codebase
- Deployment-ready with CI/CD pipeline

**Optional Enhancements:**
- Animations, hover effects, modal dialogs
- Dark mode, categories/tags, due dates
- Search/filter, drag-and-drop, bulk operations

## Outcome

- ✅ Impact: Established foundational principles and standards for entire project
- 🧪 Tests: None required (constitution document)
- 📁 Files: Created .specify/memory/constitution.md (1 file)
- 🔁 Next prompts: Create feature spec with /sp.specify, or begin planning with /sp.plan
- 🧠 Reflection: Constitution provides clear guardrails for all development work, emphasizing security, spec-driven development, and quality standards

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (constitution creation)
- Prompt variant (if applicable): Standard constitution creation
- Next experiment (smallest change to try): Proceed to feature specification phase
