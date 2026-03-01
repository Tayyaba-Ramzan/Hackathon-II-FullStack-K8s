# Research: Backend & Database – High-Level Todo App

**Feature**: 001-backend-database
**Date**: 2026-02-23
**Purpose**: Document technology choices, best practices, and architectural decisions for the backend API implementation

## Technology Stack Decisions

### 1. FastAPI Framework

**Decision**: Use FastAPI as the web framework for the REST API

**Rationale**:
- Explicitly specified in feature requirements
- High performance (built on Starlette and Pydantic)
- Automatic OpenAPI documentation generation (satisfies FR-020)
- Native async/await support for concurrent request handling
- Built-in request/response validation via Pydantic (satisfies FR-007)
- Type hints throughout for better IDE support and error detection
- Large ecosystem and active community

**Alternatives Considered**:
- Flask: Simpler but lacks built-in validation and async support
- Django REST Framework: More opinionated, heavier, includes features we don't need (admin panel, ORM we're not using)
- Express.js (Node.js): Different language, not specified in requirements

**Best Practices**:
- Use APIRouter for modular route organization
- Implement dependency injection for database sessions
- Use Pydantic models for request/response validation
- Leverage automatic OpenAPI docs at `/docs` endpoint
- Implement proper exception handlers for consistent error responses

### 2. SQLModel ORM

**Decision**: Use SQLModel for database operations and model definitions

**Rationale**:
- Explicitly specified in feature requirements
- Combines SQLAlchemy (mature ORM) with Pydantic (validation)
- Single model definition for both database and API schemas
- Type-safe database operations
- Excellent integration with FastAPI
- Reduces code duplication between DB models and API schemas

**Alternatives Considered**:
- Pure SQLAlchemy: More verbose, requires separate Pydantic models
- Raw SQL with psycopg2: No ORM benefits, more error-prone
- Tortoise ORM: Less mature, smaller community

**Best Practices**:
- Define models with proper type hints
- Use SQLModel's Field() for constraints and validation
- Separate table models from API schemas when needed
- Implement proper relationships (foreign keys)
- Use sessions properly (dependency injection pattern)

### 3. Neon Serverless PostgreSQL

**Decision**: Use Neon as the PostgreSQL database provider

**Rationale**:
- Explicitly specified in feature requirements
- Serverless architecture (auto-scaling, pay-per-use)
- PostgreSQL compatibility (standard SQL, ACID compliance)
- Built-in connection pooling
- Suitable for hackathon/demo projects
- Easy setup and management

**Alternatives Considered**:
- Self-hosted PostgreSQL: More operational overhead
- AWS RDS: More expensive, more complex setup
- SQLite: Not suitable for multi-user production apps

**Best Practices**:
- Use connection pooling (SQLModel/SQLAlchemy handles this)
- Store DATABASE_URL in environment variables
- Use connection string format: `postgresql://user:password@host:port/database`
- Implement proper session management (create/close per request)
- Handle connection errors gracefully (503 Service Unavailable)

### 4. Pydantic for Validation

**Decision**: Use Pydantic models for request/response validation

**Rationale**:
- Built into FastAPI
- Automatic validation of incoming requests
- Type coercion and error messages
- JSON schema generation for OpenAPI docs
- Satisfies FR-007, FR-016, FR-017

**Best Practices**:
- Create separate schemas for Create, Read, Update operations
- Use Field() for additional validation (min/max length, regex)
- Implement custom validators when needed
- Return consistent error format (422 Unprocessable Entity)

## Architecture Patterns

### 1. Modular Structure (Routers, Models, Schemas)

**Pattern**: Separate concerns into distinct modules

**Structure**:
```
app/
├── main.py           # Application entry, middleware, startup
├── database.py       # DB connection and session factory
├── config.py         # Environment variables
├── models/           # SQLModel database models
├── schemas/          # Pydantic request/response schemas
├── routers/          # API endpoint handlers
└── utils/            # Shared utilities (error handlers)
```

**Benefits**:
- Clear separation of concerns
- Easy to locate and modify code
- Supports team collaboration
- Facilitates testing
- Satisfies FR-019

### 2. Dependency Injection for Database Sessions

**Pattern**: Use FastAPI's dependency injection for database sessions

**Implementation**:
```python
def get_session():
    with Session(engine) as session:
        yield session

@app.get("/tasks")
def get_tasks(session: Session = Depends(get_session)):
    # Use session here
```

**Benefits**:
- Automatic session lifecycle management
- Easy to mock for testing
- Prevents session leaks
- Clean, testable code

### 3. RESTful API Design

**Pattern**: Follow REST conventions for endpoint design

**Conventions**:
- GET /tasks - List all tasks
- GET /tasks/{id} - Get single task
- POST /tasks - Create task
- PUT /tasks/{id} - Update task
- DELETE /tasks/{id} - Delete task
- PATCH /tasks/{id}/toggle - Toggle completion

**Benefits**:
- Predictable API structure
- Standard HTTP semantics
- Easy for frontend to consume
- Satisfies FR-001 through FR-006

### 4. Error Handling Strategy

**Pattern**: Centralized exception handling with consistent error responses

**Implementation**:
- Custom exception classes for domain errors
- FastAPI exception handlers for consistent formatting
- Proper HTTP status codes (400, 404, 422, 500, 503)
- Detailed error messages in JSON format

**Error Response Format**:
```json
{
  "detail": "Error message",
  "status_code": 404,
  "error_type": "NotFound"
}
```

**Benefits**:
- Consistent error format across all endpoints
- Clear error messages for debugging
- Proper HTTP semantics
- Satisfies FR-008, FR-017

## Database Schema Design

### Entity Relationships

**User → Task**: One-to-Many
- One user can have many tasks
- Each task belongs to exactly one user
- Foreign key: task.user_id → user.id
- Cascade delete: When user deleted, delete their tasks (or prevent deletion if tasks exist)

### Indexing Strategy

**Primary Indexes**:
- user.id (primary key, auto-indexed)
- task.id (primary key, auto-indexed)

**Secondary Indexes**:
- task.user_id (foreign key, for filtering tasks by user)
- user.email (unique constraint, for login lookups in future auth)
- user.username (unique constraint, for uniqueness validation)

**Benefits**:
- Fast task lookups by user
- Fast user lookups by email/username
- Satisfies SC-004

## Environment Configuration

### Required Environment Variables

```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8000  # Optional, defaults to 8000
HOST=0.0.0.0  # Optional, defaults to 0.0.0.0
```

### Configuration Management

**Pattern**: Use pydantic-settings for type-safe config

**Implementation**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    port: int = 8000
    host: str = "0.0.0.0"

    class Config:
        env_file = ".env"
```

**Benefits**:
- Type-safe configuration
- Automatic .env file loading
- Validation of required variables
- Satisfies FR-018

## Testing Strategy (Optional)

### Test Structure

```
tests/
├── conftest.py          # Fixtures (test DB, test client)
├── test_users.py        # User endpoint tests
└── test_tasks.py        # Task endpoint tests
```

### Testing Approach

**Unit Tests**: Test individual functions and models
**Integration Tests**: Test API endpoints with test database
**Tools**: pytest, pytest-asyncio, httpx (for async client)

**Test Database**: Use separate test database or in-memory SQLite for speed

## API Documentation

### OpenAPI/Swagger

**Automatic Generation**: FastAPI generates OpenAPI schema automatically

**Access Points**:
- `/docs` - Swagger UI (interactive documentation)
- `/redoc` - ReDoc (alternative documentation UI)
- `/openapi.json` - Raw OpenAPI schema

**Benefits**:
- No manual documentation needed
- Interactive API testing
- Client SDK generation possible
- Satisfies FR-020, SC-005

## Performance Considerations

### Connection Pooling

**Implementation**: SQLAlchemy's connection pool (via SQLModel)

**Configuration**:
```python
engine = create_engine(
    database_url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True  # Verify connections before use
)
```

### Async Operations

**Note**: While FastAPI supports async, SQLModel/SQLAlchemy 1.4 is primarily synchronous. For this feature, synchronous operations are sufficient given the performance goals (<200ms, 100 concurrent requests).

**Future Enhancement**: Consider async SQLAlchemy 2.0 if performance requirements increase.

## Security Considerations

### Input Validation

- Pydantic validates all request data
- Type checking prevents injection attacks
- Field constraints (max length, patterns)

### SQL Injection Prevention

- SQLModel/SQLAlchemy uses parameterized queries
- No raw SQL string concatenation
- ORM handles escaping automatically

### Environment Variables

- Never commit .env files
- Use .env.example as template
- Document all required variables
- Satisfies FR-018

### CORS (Future Consideration)

**Note**: CORS configuration not specified in this spec but will be needed when frontend is added. Use FastAPI's CORSMiddleware.

## Deployment Considerations

### ASGI Server

**Choice**: Uvicorn (recommended by FastAPI)

**Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

**Production**: Use Gunicorn with Uvicorn workers for better process management

### Environment Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables (DATABASE_URL)
3. Run database migrations (if using Alembic)
4. Start server: `uvicorn app.main:app`

### Health Check Endpoint

**Recommendation**: Add `/health` endpoint for monitoring

```python
@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## Summary

All technology choices are aligned with the feature specification requirements. The architecture follows FastAPI best practices with clear separation of concerns, proper validation, and scalable patterns. No unresolved clarifications remain - all decisions are documented with rationale and alternatives considered.

**Next Steps**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md)
