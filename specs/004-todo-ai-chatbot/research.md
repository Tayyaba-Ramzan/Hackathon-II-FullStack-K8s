# Research: Todo AI Chatbot

**Feature**: 004-todo-ai-chatbot
**Date**: 2026-02-26
**Purpose**: Document technology choices, best practices, and architectural decisions for AI-powered conversational task management

## Technology Stack Decisions

### Backend Framework: FastAPI

**Decision**: Use FastAPI for the backend API server

**Rationale**:
- Native async/await support for handling concurrent chat requests
- Automatic OpenAPI documentation for API contracts
- Pydantic integration for request/response validation
- Fast performance suitable for real-time chat interactions
- Excellent Python ecosystem compatibility with OpenAI SDK

**Alternatives Considered**:
- Flask: Lacks native async support, less suitable for real-time applications
- Django: Too heavyweight for a stateless API server, includes unnecessary ORM features
- Node.js/Express: Would require different language from Python-based OpenAI Agents SDK

### AI Framework: OpenAI Agents SDK

**Decision**: Use OpenAI Agents SDK for natural language processing and tool orchestration

**Rationale**:
- Built-in support for function calling (MCP tools)
- Conversation context management
- Streaming response support for better UX
- Official SDK with ongoing support and updates
- Handles prompt engineering and response generation

**Alternatives Considered**:
- LangChain: More complex, adds unnecessary abstraction layer
- Direct OpenAI API: Requires manual tool orchestration and context management
- Anthropic Claude API: Would require custom tool integration

### Frontend Framework: Next.js 16+ with ChatKit

**Decision**: Use Next.js App Router with ChatKit UI components

**Rationale**:
- Server-side rendering for initial page load performance
- App Router provides modern React patterns
- ChatKit provides pre-built conversational UI components
- TypeScript support for type safety
- Easy API integration with backend

**Alternatives Considered**:
- React SPA: Lacks SSR benefits, slower initial load
- Vue.js: Less ecosystem support for chat UI libraries
- Custom chat UI: Reinventing the wheel, slower development

### Database: Neon Serverless PostgreSQL

**Decision**: Use Neon Serverless PostgreSQL for all persistent storage

**Rationale**:
- Serverless scaling matches stateless backend architecture
- PostgreSQL provides ACID guarantees for conversation integrity
- JSON support for storing tool_calls metadata
- Connection pooling built-in
- Cost-effective for variable workloads

**Alternatives Considered**:
- MongoDB: Lacks strong consistency guarantees for conversations
- SQLite: Not suitable for multi-user concurrent access
- Redis: Not suitable as primary storage (lacks durability guarantees)

### ORM: SQLModel

**Decision**: Use SQLModel for database operations

**Rationale**:
- Combines SQLAlchemy and Pydantic for type safety
- FastAPI native integration
- Async support for non-blocking database queries
- Automatic validation of database models

**Alternatives Considered**:
- Raw SQL: Error-prone, lacks type safety
- SQLAlchemy alone: Requires separate Pydantic models
- Prisma: Requires Node.js, not Python-native

## Architecture Patterns

### Stateless Backend Pattern

**Pattern**: Stateless API server with database-backed sessions

**Implementation**:
- No in-memory session storage
- All conversation state in PostgreSQL
- JWT tokens for authentication (no server-side sessions)
- Horizontal scaling capability

**Benefits**:
- Easy to scale horizontally
- No session synchronization issues
- Crash recovery without data loss
- Simplified deployment

### MCP Tool Pattern

**Pattern**: Model Context Protocol for AI tool integration

**Implementation**:
- Each task operation (add, list, complete, delete, update) as separate tool
- Tools validate input and enforce user_id isolation
- Tools return structured responses for AI interpretation
- Tools log all operations for audit trail

**Benefits**:
- Clear separation between AI logic and business logic
- Testable tool implementations
- Auditable operations
- Reusable across different AI frameworks

### 7-Step Conversation Flow

**Pattern**: Structured pipeline for message processing

**Implementation**:
1. Receive message → validate user_id and input
2. Fetch history → load conversation context from database
3. Store user message → persist before processing
4. Run agent → execute AI with full context
5. Invoke MCP tools → agent calls tools as needed
6. Store AI response → persist response and tool_calls
7. Return response → send to frontend with conversation_id

**Benefits**:
- Conversation recovery after failures
- Complete audit trail
- Consistent error handling
- Testable at each step

## Best Practices

### Security Best Practices

**Authentication**:
- Better Auth for user authentication
- JWT tokens with short expiration (15 minutes)
- Refresh token rotation
- user_id extracted from verified JWT

**Authorization**:
- user_id validation on every request
- Database queries filtered by user_id
- No cross-user data access
- MCP tools enforce user_id isolation

**Input Validation**:
- Pydantic models for all API inputs
- SQL injection prevention via parameterized queries
- XSS prevention via output encoding
- Rate limiting on chat endpoint

### Performance Best Practices

**Database Optimization**:
- Indexes on user_id, conversation_id, created_at
- Connection pooling (10-20 connections)
- Async queries to avoid blocking
- Pagination for message history (limit 100 messages per fetch)

**API Optimization**:
- Streaming responses for long AI generations
- Caching for frequently accessed data
- Async/await throughout request pipeline
- Response compression (gzip)

**Frontend Optimization**:
- Code splitting for ChatKit components
- Lazy loading for conversation history
- Optimistic UI updates for better perceived performance
- WebSocket consideration for future real-time updates

### Error Handling Best Practices

**Backend Error Handling**:
- Try-catch blocks around AI calls
- Graceful degradation when AI service unavailable
- Human-readable error messages
- Structured logging with request IDs

**Frontend Error Handling**:
- Display user-friendly error messages
- Retry logic for transient failures
- Offline detection and messaging
- Error boundary components

## Integration Patterns

### OpenAI Agents SDK Integration

**Pattern**: Agent as orchestrator with MCP tools

**Implementation**:
```
User Message → Agent receives with conversation history
             → Agent decides which tools to call
             → Agent calls MCP tools (add_task, list_tasks, etc.)
             → Agent generates natural language response
             → Response includes tool call metadata
```

**Configuration**:
- System prompt defines agent behavior and tool usage
- Temperature: 0.7 for natural responses
- Max tokens: 500 for concise responses
- Tool choice: auto (agent decides when to use tools)

### ChatKit Integration

**Pattern**: Controlled component with API service layer

**Implementation**:
- ChatInterface component manages UI state
- API service handles backend communication
- Optimistic updates for better UX
- Message queue for handling rapid inputs

**Components**:
- ChatInterface: Main container
- MessageList: Displays conversation history
- InputBox: User input with send button
- TypingIndicator: Shows AI is processing
- ErrorMessage: Displays errors inline

## Migration Strategy

**Phase 1**: Backend core (API + MCP tools)
**Phase 2**: Frontend core (ChatKit UI + API integration)
**Phase 3**: Integration testing and refinement
**Phase 4**: Performance optimization and monitoring

**Rollback Plan**:
- Database migrations are reversible
- Feature flags for gradual rollout
- Blue-green deployment for zero downtime

## Open Questions Resolved

All technical decisions have been made based on the specification and user input. No clarifications needed.
