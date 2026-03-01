# Research: Authentication & Security – High-Level Todo App

**Feature**: 002-auth-security
**Date**: 2026-02-23
**Purpose**: Document technology choices, best practices, and architectural decisions for authentication and security implementation

## Technology Stack Decisions

### 1. JWT (JSON Web Tokens) for Authentication

**Decision**: Use JWT tokens for stateless authentication

**Rationale**:
- Explicitly specified in feature requirements
- Stateless architecture - no server-side session storage needed
- Self-contained tokens include user_id and expiration
- Industry standard for API authentication
- Works seamlessly with REST APIs
- Scales horizontally without session synchronization
- Frontend can easily attach to requests via Authorization header

**Alternatives Considered**:
- Session-based authentication: Requires server-side storage, doesn't scale as well
- OAuth2: Too complex for MVP, out of scope per specification
- API keys: Less secure, no expiration mechanism

**Best Practices**:
- Use HS256 algorithm (HMAC with SHA-256) for signing
- Include user_id, iat (issued at), and exp (expiration) in payload
- Set reasonable expiration time (1 hour default)
- Store JWT secret in environment variables
- Validate signature on every request
- Return 401 for invalid/expired tokens

### 2. Better Auth for Frontend Authentication

**Decision**: Use Better Auth library for frontend authentication logic

**Rationale**:
- Explicitly specified in feature requirements
- Modern authentication library for Next.js
- Provides JWT plugin for token management
- Handles token storage (localStorage or httpOnly cookies)
- Simplifies auth state management in React
- Type-safe with TypeScript support

**Alternatives Considered**:
- NextAuth.js: More opinionated, includes OAuth which is out of scope
- Custom implementation: More work, reinventing the wheel
- Auth0/Clerk: Third-party services, adds external dependency

**Best Practices**:
- Configure Better Auth with JWT plugin
- Store tokens securely (httpOnly cookies preferred over localStorage)
- Implement auth context provider for React components
- Handle token refresh if implementing optional feature
- Clear tokens on logout

### 3. PyJWT for Backend JWT Handling

**Decision**: Use PyJWT library for JWT generation and validation in FastAPI

**Rationale**:
- Most popular JWT library for Python
- Well-maintained and battle-tested
- Simple API for encoding/decoding tokens
- Supports multiple algorithms (HS256, RS256, etc.)
- Good error handling for invalid tokens
- Compatible with FastAPI

**Alternatives Considered**:
- python-jose: Another popular option, similar features
- authlib: More comprehensive but heavier
- Custom implementation: Security risk, not recommended

**Best Practices**:
- Use `jwt.encode()` for token generation
- Use `jwt.decode()` with signature verification
- Handle `ExpiredSignatureError` and `InvalidTokenError`
- Set algorithm explicitly (HS256)
- Include required claims: user_id, exp, iat

### 4. Passlib with Bcrypt for Password Hashing

**Decision**: Use passlib library with bcrypt algorithm for password hashing

**Rationale**:
- Industry-standard password hashing
- Bcrypt is designed to be slow (prevents brute force)
- Passlib provides high-level API for password operations
- Automatic salt generation
- Compatible with FastAPI and SQLModel
- Recommended by OWASP

**Alternatives Considered**:
- Argon2: More modern, but bcrypt is sufficient for MVP
- PBKDF2: Older, less secure than bcrypt
- Plain bcrypt library: Passlib provides better API

**Best Practices**:
- Use `CryptContext` with bcrypt scheme
- Never store passwords in plain text
- Hash passwords before database insertion
- Use `verify()` method for password comparison
- Set appropriate rounds (12-14 for bcrypt)

## Architecture Patterns

### 1. JWT Middleware Pattern

**Pattern**: Dependency injection middleware for JWT validation

**Implementation**:
```python
# Middleware extracts and validates JWT from Authorization header
# Injects current_user into route handlers
# Returns 401 for invalid/missing tokens

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    token = credentials.credentials
    # Validate JWT and extract user_id
    # Query database for user
    # Return user object or raise 401
```

**Benefits**:
- Reusable across all protected endpoints
- Clean separation of concerns
- Easy to test
- Follows FastAPI dependency injection pattern
- Automatic OpenAPI documentation

### 2. User Isolation Pattern

**Pattern**: Automatic filtering by authenticated user_id

**Implementation**:
```python
# Extract user_id from JWT token
# Add WHERE user_id = {authenticated_user_id} to all queries
# Prevent cross-user data access

@router.get("/tasks")
def get_tasks(current_user: User = Depends(get_current_user)):
    # Automatically filter by current_user.id
    tasks = session.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks
```

**Benefits**:
- Enforces data isolation at API layer
- Prevents accidental data leakage
- Simple to implement and understand
- Works with existing database schema
- No changes to frontend required

### 3. Password Hashing Pattern

**Pattern**: Hash passwords before storage, verify on login

**Implementation**:
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Registration
hashed_password = pwd_context.hash(plain_password)
user.password_hash = hashed_password

# Login
is_valid = pwd_context.verify(plain_password, user.password_hash)
```

**Benefits**:
- Secure password storage
- Automatic salt generation
- Slow hashing prevents brute force
- Industry standard approach

### 4. Frontend Auth Context Pattern

**Pattern**: React Context for auth state management

**Implementation**:
```typescript
// AuthContext provides: user, token, login, logout, register
// Wraps entire app in AuthProvider
// Components use useAuth() hook to access auth state
// Automatically attaches JWT to API requests
```

**Benefits**:
- Centralized auth state
- Easy to access from any component
- Automatic token management
- Clean separation of concerns

## Security Considerations

### JWT Token Security

**Best Practices**:
- Use strong secret key (minimum 32 characters, random)
- Store secret in environment variables, never in code
- Set appropriate expiration time (1 hour default)
- Use HTTPS in production to protect tokens in transit
- Validate signature on every request
- Include minimal data in payload (just user_id)

**Threats Mitigated**:
- Token tampering: Signature validation prevents modification
- Token theft: Expiration limits damage window
- Replay attacks: Expiration and HTTPS reduce risk

### Password Security

**Best Practices**:
- Enforce password strength requirements (8+ chars, mixed case, numbers)
- Use bcrypt with appropriate rounds (12-14)
- Never log passwords
- Never return password hashes in API responses
- Rate limit login attempts (optional for MVP)

**Threats Mitigated**:
- Brute force attacks: Slow hashing and password requirements
- Rainbow table attacks: Automatic salting
- Database breach: Hashed passwords can't be reversed

### User Isolation Security

**Best Practices**:
- Extract user_id from validated JWT token
- Filter all queries by authenticated user_id
- Return 403 Forbidden for cross-user access attempts
- Never trust user_id from request body or query params
- Validate ownership before update/delete operations

**Threats Mitigated**:
- Unauthorized data access: Automatic filtering prevents cross-user access
- Data modification attacks: Ownership validation prevents unauthorized changes
- Privilege escalation: No admin roles, all users equal

## Database Schema Changes

### User Model Extension

**Changes Required**:
- Add `password_hash` field to User model (String, not nullable)
- Keep existing fields: id, email, username, created_at
- Email and username remain unique

**Migration Strategy**:
- For existing users: Set temporary password or require password reset
- For new users: Hash password during registration
- SQLModel will auto-create column on next startup

**Schema**:
```sql
ALTER TABLE user ADD COLUMN password_hash VARCHAR(255) NOT NULL;
```

## API Endpoint Design

### Authentication Endpoints

**POST /auth/register**:
- Input: email, username, password
- Validation: Email format, username length, password strength, uniqueness
- Output: User object (without password_hash)
- Status: 201 Created, 400 Bad Request

**POST /auth/login**:
- Input: email, password
- Validation: Email exists, password matches
- Output: JWT token, user object
- Status: 200 OK, 401 Unauthorized

**Protected Endpoints**:
- All existing task endpoints require JWT
- All existing user endpoints require JWT (except register/login)
- Extract user_id from JWT and filter data

## Frontend Implementation Strategy

### Better Auth Configuration

**Setup**:
1. Install Better Auth and JWT plugin
2. Configure auth client with backend API URL
3. Set up JWT storage (httpOnly cookies recommended)
4. Create auth context provider
5. Wrap app in AuthProvider

**Token Management**:
- Store JWT token after successful login
- Attach token to all API requests via Authorization header
- Clear token on logout
- Handle token expiration (redirect to login)

### UI Components

**Sign Up Page**:
- Form fields: email, username, password, confirm password
- Client-side validation
- Call /auth/register endpoint
- Redirect to sign in on success

**Sign In Page**:
- Form fields: email, password
- Call /auth/login endpoint
- Store JWT token
- Redirect to dashboard on success

**Protected Routes**:
- Check for valid JWT token
- Redirect to sign in if not authenticated
- Show loading state while validating

## Testing Strategy

### Backend Testing (Optional)

**Unit Tests**:
- Password hashing and verification
- JWT token generation and validation
- User isolation logic

**Integration Tests**:
- Registration endpoint with various inputs
- Login endpoint with valid/invalid credentials
- Protected endpoints with/without JWT
- Cross-user access attempts (should fail)

### Frontend Testing (Optional)

**Component Tests**:
- Sign up form validation
- Sign in form submission
- Auth context state management

**E2E Tests**:
- Complete registration flow
- Complete login flow
- Protected route access
- Logout flow

## Performance Considerations

### JWT Validation Overhead

**Expected Impact**: <50ms per request
**Optimization**:
- JWT validation is fast (signature check)
- No database query needed for validation
- User lookup only if needed (can cache)

### Password Hashing Performance

**Expected Impact**: <200ms for registration/login
**Optimization**:
- Bcrypt is intentionally slow (security feature)
- Only happens on registration and login
- Acceptable for user-facing operations

### Database Queries

**User Isolation Filtering**:
- Add WHERE user_id = ? to all task queries
- Ensure user_id column is indexed (already done in Feature 001)
- No significant performance impact

## Environment Variables

### Required Variables

```env
# Existing from Feature 001
DATABASE_URL=postgresql://...
HOST=0.0.0.0
PORT=8000

# New for Authentication
JWT_SECRET=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1
```

### Security Notes

- JWT_SECRET must be strong (32+ random characters)
- Never commit .env file to version control
- Use different secrets for dev/staging/production
- Rotate secrets periodically in production

## Deployment Considerations

### HTTPS Requirement

**Critical**: JWT tokens must be transmitted over HTTPS in production
- Prevents token interception
- Protects passwords during login
- Required for httpOnly cookies

### CORS Configuration

**Required**: Configure CORS to allow frontend domain
- Allow Authorization header
- Allow credentials if using httpOnly cookies
- Restrict to specific frontend domain in production

### Token Expiration

**Default**: 1 hour
**Considerations**:
- Shorter = more secure, more frequent logins
- Longer = better UX, higher security risk
- Optional: Implement token refresh for longer sessions

## Summary

All technology choices align with the feature specification requirements. The architecture uses industry-standard patterns for JWT authentication, password hashing, and user isolation. No unresolved clarifications remain - all decisions are documented with rationale and alternatives considered.

**Next Steps**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md)
