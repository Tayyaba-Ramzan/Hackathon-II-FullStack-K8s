---
name: backend-skill
description: Handle backend operations including route generation, request/response handling, and database connections.
---

# Backend Skill

## Instructions

1. **Route Generation**
   - Define RESTful routes for CRUD operations
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Organize routes by feature/module for maintainability
   - Implement route-level middleware for authentication or validation

2. **Request/Response Handling**
   - Validate incoming requests (query, params, body)
   - Sanitize and normalize input data
   - Handle responses consistently with proper status codes
   - Manage error handling and logging for debugging
   - Support JSON response formatting and serialization

3. **Database Connection**
   - Connect to databases securely (PostgreSQL, MySQL, or ORM)
   - Perform CRUD operations with transactions if necessary
   - Optimize queries for performance and efficiency
   - Handle connection pooling and resource management

4. **Security and Best Practices**
   - Protect endpoints with authentication/authorization
   - Prevent common backend vulnerabilities (SQL injection, XSS)
   - Use environment variables for sensitive credentials
   - Write modular, reusable, and testable backend code

## Best Practices
- Keep route and handler names consistent and meaningful  
- Handle errors gracefully without exposing sensitive information  
- Use async/await for non-blocking operations  
- Version-control database migrations and backend changes  
- Test all routes and database interactions thoroughly  

## Example Structure

```ts
// FastAPI Example
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from db import get_db, UserModel

app = FastAPI()

class UserCreate(BaseModel):
    email: str
    password: str

@app.post("/users")
async def create_user(user: UserCreate, db=Depends(get_db)):
    if db.user_exists(user.email):
        raise HTTPException(status_code=400, detail="User already exists")
    user_id = db.insert_user(user.email, user.password)
    return {"id": user_id, "email": user.email}