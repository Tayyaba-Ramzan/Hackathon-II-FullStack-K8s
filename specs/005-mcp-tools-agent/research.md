# Research: MCP Tools + Agent Backend

**Feature**: 005-mcp-tools-agent
**Date**: 2026-02-26
**Status**: Complete

## Overview

This document captures technical research and decisions for implementing the MCP Tools + Agent Backend feature. Since the technical context was well-defined from the specification and constitution, no major unknowns required investigation. This document serves as a record of key decisions and their rationale.

## Technical Decisions

### Decision 1: OpenAI Agents SDK vs Custom Agent Implementation

**Decision**: Use OpenAI Python SDK with function calling (tool use) feature

**Rationale**:
- OpenAI's function calling provides native support for tool invocation
- Structured output format matches our MCP tool requirements
- Built-in conversation context management
- Well-documented and actively maintained
- Reduces custom code for natural language → tool mapping

**Alternatives Considered**:
- LangChain: More complex, adds unnecessary abstraction layer
- Custom prompt engineering: Requires more maintenance, less reliable
- Anthropic Claude: Would require different SDK, OpenAI already chosen in constitution

**Implementation Notes**:
- Use `openai.ChatCompletion.create()` with `functions` parameter
- Define MCP tools as OpenAI function schemas
- System prompt guides agent behavior and tool usage
- Handle tool calls in response and execute via MCP registry

---

### Decision 2: SQLModel vs SQLAlchemy for Database ORM

**Decision**: Use SQLModel for async database operations

**Rationale**:
- SQLModel combines SQLAlchemy with Pydantic for type safety
- Native async support with asyncpg driver
- Pydantic integration provides automatic validation
- Simpler syntax than raw SQLAlchemy
- Already used in Phase II, maintains consistency

**Alternatives Considered**:
- Raw SQLAlchemy: More verbose, less type-safe
- Django ORM: Not compatible with FastAPI async patterns
- Tortoise ORM: Less mature, smaller community

**Implementation Notes**:
- Use `AsyncSession` for all database operations
- Define models with SQLModel base class
- Use Pydantic validators for field validation
- Connection pooling configured in connection.py

---

### Decision 3: MCP Tool Registry Pattern

**Decision**: Centralized registry with OpenAI function definitions

**Rationale**:
- Single source of truth for tool definitions
- Easy to add/remove tools without modifying agent code
- OpenAI function schemas generated from tool metadata
- Simplifies tool invocation and error handling
- Enables tool discovery and documentation

**Alternatives Considered**:
- Decorator-based registration: Less explicit, harder to debug
- Manual function definitions: Prone to sync issues between code and schema
- Dynamic discovery: Adds complexity, not needed for 5 tools

**Implementation Notes**:
- `registry.py` exports `get_tool_definitions()` and `execute_tool()`
- Each tool file exports metadata and async function
- Registry validates tool parameters before execution
- Registry handles user_id injection for security

---

### Decision 4: Conversation Storage Strategy

**Decision**: Store full conversation history in database with message-level granularity

**Rationale**:
- Enables conversation recovery across sessions
- Supports conversation branching in future
- Allows tool_calls metadata storage for transparency
- Facilitates audit trail and debugging
- Aligns with 7-step conversation pipeline

**Alternatives Considered**:
- Session-based storage: Violates stateless principle
- Redis cache: Adds dependency, not persistent
- File-based storage: Poor query performance, no ACID guarantees

**Implementation Notes**:
- Separate tables for conversations and messages
- Messages include role (user/assistant), content, tool_calls JSON
- Conversation_id links messages together
- Indexes on user_id and created_at for query performance

---

### Decision 5: Error Handling Strategy for MCP Tools

**Decision**: Return structured error responses with user-friendly messages

**Rationale**:
- Users should see actionable error messages, not stack traces
- Agent can incorporate error context into responses
- Enables retry logic with corrected parameters
- Maintains security by not exposing system internals

**Alternatives Considered**:
- Exception propagation: Exposes technical details to users
- Silent failures: Poor user experience, hard to debug
- Generic error messages: Not actionable for users

**Implementation Notes**:
- Each tool returns `{"success": bool, "message": str, "data": dict}`
- Agent service catches exceptions and formats user-friendly messages
- Logging captures full error details for debugging
- HTTP status codes map to error types (400, 401, 403, 500)

---

### Decision 6: Stateless API Design with Database Context

**Decision**: No in-memory session state, all context from database via conversation_id

**Rationale**:
- Enables horizontal scaling without sticky sessions
- Simplifies deployment and load balancing
- Conversation recovery works across server restarts
- Aligns with constitution's stateless principle

**Alternatives Considered**:
- Session-based state: Violates constitution, not scalable
- JWT-embedded state: Token size limits, security concerns
- Redis session store: Adds dependency, still stateful

**Implementation Notes**:
- Each request loads conversation history from database
- No global state or class-level variables
- Connection pooling handles database performance
- conversation_id is the only state identifier

---

### Decision 7: Authentication Integration with Better Auth

**Decision**: JWT token validation via Better Auth middleware

**Rationale**:
- Better Auth mandated by constitution
- JWT tokens are stateless and scalable
- Middleware pattern keeps auth logic separate
- user_id extracted from validated token

**Alternatives Considered**:
- Session cookies: Stateful, not scalable
- API keys: Less secure, no user context
- OAuth2 only: Requires external provider

**Implementation Notes**:
- Middleware validates JWT signature and expiration
- user_id extracted from token claims
- All protected endpoints use `Depends(get_current_user)`
- Token refresh handled by Better Auth

---

## Performance Considerations

### Database Query Optimization

**Strategy**: Indexes on frequently queried columns

**Implementation**:
- Index on `user_id` for all tables (user isolation queries)
- Index on `conversation_id` for messages table (history queries)
- Index on `created_at` for time-based sorting
- Connection pooling (10-20 connections) for concurrent requests

**Expected Performance**:
- Conversation history query: <200ms for 100 messages
- MCP tool execution: <500ms including database write
- Full API request: <2s including OpenAI API call

---

### OpenAI API Rate Limiting

**Strategy**: Implement retry logic with exponential backoff

**Implementation**:
- Catch rate limit errors (429 status)
- Retry with exponential backoff (1s, 2s, 4s)
- User-friendly error message if retries exhausted
- Consider request queuing for high load

---

## Security Considerations

### User Isolation Enforcement

**Strategy**: Multi-layer isolation (API, service, database)

**Implementation**:
- API layer: Validate user_id from JWT matches path parameter
- Service layer: All queries filtered by user_id
- Database layer: Foreign key constraints enforce relationships
- MCP tools: user_id parameter required and validated

---

### Input Validation

**Strategy**: Pydantic models for all inputs

**Implementation**:
- Request models validate message length, format
- MCP tool parameters validated before execution
- SQL injection prevented by parameterized queries (SQLModel)
- XSS prevention by not rendering user content as HTML

---

## Testing Strategy

### Unit Tests

**Scope**: MCP tools, services, utilities

**Approach**:
- Mock database for tool tests
- Mock OpenAI API for agent service tests
- Test user isolation enforcement
- Test error handling paths

---

### Integration Tests

**Scope**: API endpoints, database operations

**Approach**:
- Test database with test fixtures
- Test full conversation flow
- Test authentication middleware
- Test concurrent requests

---

### Contract Tests

**Scope**: MCP tool interfaces, API contracts

**Approach**:
- Verify tool function signatures match OpenAI schemas
- Verify API request/response formats
- Test backward compatibility

---

## Dependencies

### Core Dependencies

- **fastapi**: Web framework (async support)
- **openai**: OpenAI Python SDK for agent
- **sqlmodel**: ORM with Pydantic integration
- **asyncpg**: Async PostgreSQL driver
- **python-jose**: JWT token handling
- **bcrypt**: Password hashing
- **pydantic**: Data validation
- **uvicorn**: ASGI server

### Development Dependencies

- **pytest**: Testing framework
- **pytest-asyncio**: Async test support
- **httpx**: Async HTTP client for tests
- **faker**: Test data generation

---

## Deployment Considerations

### Environment Variables

Required:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key
- `JWT_SECRET`: Secret for JWT signing
- `BETTER_AUTH_SECRET`: Better Auth configuration

Optional:
- `LOG_LEVEL`: Logging verbosity (default: INFO)
- `DB_POOL_SIZE`: Connection pool size (default: 10)
- `API_RATE_LIMIT`: Requests per minute (default: 60)

---

### Database Migrations

**Strategy**: Version-controlled migration scripts

**Implementation**:
- Migration files in `backend/src/db/migrations/`
- Run migrations on deployment before starting server
- Rollback scripts for each migration
- Test migrations on staging before production

---

## Conclusion

All technical decisions align with the Phase III constitution and support the feature requirements. No major unknowns or risks identified. Implementation can proceed to Phase 1 (design artifacts) and Phase 2 (task breakdown).
