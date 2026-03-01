---
id: 002
title: phase-iii-constitution-update
stage: constitution
date: 2026-02-26
surface: cli
model: claude-sonnet-4-6
feature: N/A
branch: main
user: Hasan
command: /sp.constitution
labels: [constitution, phase-iii, mcp-tools, agentic-workflow]
links:
  spec: N/A
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: .specify/memory/constitution.md
    action: updated
    lines_changed: 194
tests:
  - N/A
---

## Prompt

```text
# SP Constitution – Phase III (Short)

## I. Philosophy
- Follow Agentic Dev Stack: Spec → Plan → Tasks → Claude Code
- ❌ No manual coding
- ❌ No direct DB access outside MCP

## II. Architecture
- FastAPI server must be stateless
- MCP tools handle all task operations
- Frontend (ChatKit) has no business logic

## III. MCP Tools
- add_task / list_tasks / complete_task / delete_task / update_task
- Agent must confirm all actions
- Tool errors must be human-readable

## IV. Database
- Neon PostgreSQL: tasks, conversations, messages
- Store user_id, created_at, updated_at
- Conversation recovery required

## V. Conversation Flow
1. Receive message → 2. Fetch history → 3. Store user message
4. Run agent → 5. Invoke MCP tools → 6. Store AI response → 7. Return response

## VI. Security
- Better Auth required
- user_id verified
- No cross-user access

## VII. API
- POST /api/{user_id}/chat
- Response: conversation_id, response, tool_calls

## VIII. Evaluation
[truncated in user input]
```

## Response snapshot

Updated constitution from v1.0.0 (Phase II Todo CRUD app) to v2.0.0 (Phase III Agentic AI System).

**Major Changes**:
- Replaced Phase II principles (UI/UX, Reproducibility, Scalability, Rigor) with Phase III principles (Philosophy, MCP Tools, Conversation Flow, Evaluation)
- Redefined architecture: stateless FastAPI + MCP tools only (no direct DB access)
- Added 7-step conversation processing pipeline
- Expanded database schema: tasks + conversations + messages
- Updated API structure: chat endpoint with conversation_id
- Added MCP tool requirements and standards
- Removed frontend-specific standards (ChatKit is presentation-only)

**Version Bump Rationale**: MAJOR (1.0.0 → 2.0.0) due to breaking architectural changes and workflow redefinition.

## Outcome

- ✅ Impact: Constitution updated to Phase III architecture with MCP-based agentic workflow
- 🧪 Tests: N/A (constitution document)
- 📁 Files: .specify/memory/constitution.md (v2.0.0)
- 🔁 Next prompts: Implement Phase III features following new constitution (spec → plan → tasks → implement)
- 🧠 Reflection: Clean transition from Phase II (traditional CRUD) to Phase III (conversational AI with MCP tools). All principles now align with agentic development stack.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
