# Quickstart Guide: Authentication & Security Setup

**Feature**: 002-auth-security
**Date**: 2026-02-23
**Purpose**: Step-by-step guide to implement JWT authentication and user isolation

## Prerequisites

- Feature 001 (Backend & Database) must be complete and running
- Python 3.9+ with virtual environment
- Node.js 18+ and npm/yarn (for frontend)
- Neon PostgreSQL database configured
- Backend API running on http://localhost:8000

## Part 1: Backend Authentication Setup

### Step 1: Install Additional Dependencies

```bash
cd backend
pip install PyJWT==2.8.0 passlib==1.7.4 python-jose[cryptography]==3.3.0 bcrypt==4.1.2
```

**Update requirements.txt**:
```txt
# Existing dependencies
fastapi==0.109.0
sqlmodel==0.0.14
uvicorn[standard]==0.27.0
psycopg2-binary==2.9.9
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0

# New authentication dependencies
PyJWT==2.8.0
passlib==1.7.4
python-jose[cryptography]==3.3.0
bcrypt==4.1.2
```

### Step 2: Configure Environment Variables

**Update .env file**:
```env
# Existing variables
DATABASE_URL=postgresql://username:password@host:port/database
HOST=0.0.0.0
PORT=8000

# New authentication variables
JWT_SECRET=your-super-secret-key-min-32-characters-long-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1
```

**⚠️ IMPORTANT**: Generate a strong JWT_SECRET:
```bash
# Generate random secret (Linux/Mac)
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 3: Update User Model

**Edit backend/app/models/user.py**:
```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    username: str = Field(unique=True, index=True, max_length=50)
    password_hash: str = Field(max_length=255)  # NEW FIELD
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    tasks: List["Task"] = Relationship(back_populates="user")
```

### Step 4: Create Authentication Utilities

**Create backend/app/utils/password.py**:
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)
```

**Create backend/app/utils/jwt_utils.py**:
```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status
from app.config import settings

def create_access_token(user_id: int) -> str:
    """Generate JWT token for authenticated user"""
    expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
    payload = {
        "user_id": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token

def verify_token(token: str) -> int:
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

### Step 5: Create JWT Middleware

**Create backend/app/middleware/__init__.py** (empty file)

**Create backend/app/middleware/jwt_auth.py**:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.utils.jwt_utils import verify_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Extract and validate JWT token, return current user"""
    token = credentials.credentials
    user_id = verify_token(token)

    # Query database for user
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
```

### Step 6: Create Authentication Schemas

**Update backend/app/schemas/user.py**:
```python
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
import re

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be 3-50 characters')
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username must be alphanumeric with underscores')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain number')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserRead"

class UserRead(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### Step 7: Create Authentication Router

**Create backend/app/routers/auth.py**:
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, Token, UserRead
from app.utils.password import hash_password, verify_password
from app.utils.jwt_utils import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, session: Session = Depends(get_session)):
    """Register a new user"""
    # Check if email exists
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if username exists
    existing_user = session.exec(select(User).where(User.username == user_data.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, session: Session = Depends(get_session)):
    """Login user and return JWT token"""
    # Find user by email
    user = session.exec(select(User).where(User.email == credentials.email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate JWT token
    access_token = create_access_token(user.id)

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.from_orm(user)
    )
```

### Step 8: Protect Existing Endpoints

**Update backend/app/routers/tasks.py** - Add JWT middleware:
```python
from app.middleware.jwt_auth import get_current_user
from app.models.user import User

# Update all endpoints to include current_user dependency
@router.get("/tasks")
def get_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Filter by authenticated user
    tasks = session.exec(select(Task).where(Task.user_id == current_user.id)).all()
    return tasks

@router.post("/tasks", status_code=201)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Automatically set user_id from authenticated user
    task = Task(**task_data.dict(), user_id=current_user.id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

# Similar updates for GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id}
# Always filter by current_user.id to enforce user isolation
```

### Step 9: Register Auth Router

**Update backend/app/main.py**:
```python
from app.routers import auth  # Add this import

# Register auth router
app.include_router(auth.router)
```

### Step 10: Update Config

**Update backend/app/config.py**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    host: str = "0.0.0.0"
    port: int = 8000

    # New JWT settings
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 1

    class Config:
        env_file = ".env"

settings = Settings()
```

### Step 11: Test Backend Authentication

```bash
# Start the backend server
cd backend
uvicorn app.main:app --reload
```

**Test Registration**:
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123"
  }'
```

**Test Login**:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

**Test Protected Endpoint**:
```bash
# Copy the access_token from login response
curl -X GET http://localhost:8000/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Part 2: Frontend Authentication Setup

### Step 1: Initialize Next.js Frontend

```bash
# From repository root
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install better-auth @better-auth/jwt axios
```

### Step 3: Configure Better Auth

**Create frontend/lib/auth.ts**:
```typescript
import { createAuth } from 'better-auth';
import { jwtPlugin } from '@better-auth/jwt';

export const auth = createAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  plugins: [jwtPlugin()],
});
```

### Step 4: Create API Client

**Create frontend/lib/api-client.ts**:
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Attach JWT token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Step 5: Create Auth Context

**Create frontend/lib/auth-context.tsx**:
```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from './api-client';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      // Optionally validate token or fetch user info
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    setUser(user);
  };

  const register = async (email: string, username: string, password: string) => {
    await apiClient.post('/auth/register', { email, username, password });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Step 6: Create Sign Up Page

**Create frontend/app/(auth)/signup/page.tsx**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, username, password);
      router.push('/signin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
}
```

### Step 7: Create Sign In Page

**Create frontend/app/(auth)/signin/page.tsx**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Sign In
        </button>
      </form>
    </div>
  );
}
```

### Step 8: Update Root Layout

**Update frontend/app/layout.tsx**:
```typescript
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 9: Test Frontend

```bash
cd frontend
npm run dev
```

Visit:
- http://localhost:3000/signup - Create account
- http://localhost:3000/signin - Login
- Check browser console for JWT token

---

## Testing User Isolation

### Test Scenario

1. **Create User A**:
   ```bash
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "usera@example.com", "username": "usera", "password": "Password123"}'
   ```

2. **Login as User A** and save token:
   ```bash
   TOKEN_A=$(curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "usera@example.com", "password": "Password123"}' \
     | jq -r '.access_token')
   ```

3. **Create task as User A**:
   ```bash
   curl -X POST http://localhost:8000/tasks \
     -H "Authorization: Bearer $TOKEN_A" \
     -H "Content-Type: application/json" \
     -d '{"title": "User A Task"}'
   ```

4. **Create User B and login**:
   ```bash
   # Register User B
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "userb@example.com", "username": "userb", "password": "Password123"}'

   # Login as User B
   TOKEN_B=$(curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "userb@example.com", "password": "Password123"}' \
     | jq -r '.access_token')
   ```

5. **Verify User B cannot see User A's tasks**:
   ```bash
   curl -X GET http://localhost:8000/tasks \
     -H "Authorization: Bearer $TOKEN_B"
   # Should return empty array []
   ```

6. **Verify User A can still see their tasks**:
   ```bash
   curl -X GET http://localhost:8000/tasks \
     -H "Authorization: Bearer $TOKEN_A"
   # Should return User A's task
   ```

---

## Common Issues and Solutions

### Issue: "Invalid token" error

**Solution**: Check that JWT_SECRET matches between token generation and validation. Verify token is being sent in Authorization header as "Bearer {token}".

### Issue: Password validation fails

**Solution**: Ensure password meets requirements (8+ chars, uppercase, lowercase, number).

### Issue: CORS errors in frontend

**Solution**: Add CORS middleware to FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Token expired

**Solution**: Login again to get a new token. Optionally implement token refresh.

---

## Summary

You should now have:
- ✅ Backend JWT authentication with registration and login
- ✅ Password hashing with bcrypt
- ✅ JWT middleware protecting all endpoints
- ✅ User isolation enforced at API layer
- ✅ Frontend sign up and sign in pages
- ✅ JWT token attached to all API requests
- ✅ Stateless authentication architecture

The authentication system is ready for production use with proper security measures in place.
