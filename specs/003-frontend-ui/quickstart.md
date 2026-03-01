# Frontend Development Quickstart

**Feature**: 003-frontend-ui
**Created**: 2026-02-23
**Status**: Draft

## Overview

This guide provides step-by-step instructions for setting up and developing the frontend application. It covers local development, testing, and integration with the backend API.

## Prerequisites

### Required Software

- **Node.js**: v18.17.0 or higher (LTS recommended)
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

### Backend API

The frontend requires the backend API (Spec 001 & 002) to be running:
- Backend should be running on `http://localhost:8001`
- Database should be initialized with tables
- Authentication endpoints should be functional

**Verify backend is running**:
```bash
curl http://localhost:8001/
# Should return: {"message": "Todo API is running"}
```

---

## Initial Setup

### 1. Navigate to Frontend Directory

```bash
cd D:\phase_II_todo_fullstack_webapplication\frontend
```

### 2. Install Dependencies

```bash
npm install
```

**Expected packages**:
- Next.js 16+
- React 18+
- TypeScript
- TailwindCSS 3+
- Axios (API client)
- Better Auth (authentication)

### 3. Configure Environment Variables

Create `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8001

# Better Auth Configuration (if needed)
AUTH_SECRET=your-secret-key-here
AUTH_URL=http://localhost:3001
```

**Important**: Never commit `.env.local` to version control

### 4. Verify Configuration

Check that `next.config.js` is properly configured:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
```

---

## Development Workflow

### Start Development Server

```bash
npm run dev
```

**Expected output**:
```
- ready started server on 0.0.0.0:3001, url: http://localhost:3001
- event compiled client and server successfully
```

**Access the application**:
- Landing page: http://localhost:3001
- Signup: http://localhost:3001/signup
- Signin: http://localhost:3001/signin
- Dashboard: http://localhost:3001/dashboard

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page (/)
│   │   ├── layout.tsx         # Root layout
│   │   ├── signup/
│   │   │   └── page.tsx       # Signup page
│   │   ├── signin/
│   │   │   └── page.tsx       # Signin page
│   │   └── dashboard/
│   │       └── page.tsx       # Dashboard page
│   ├── components/            # Reusable components
│   │   ├── atoms/             # Basic building blocks
│   │   ├── molecules/         # Simple combinations
│   │   ├── organisms/         # Complex components
│   │   └── modals/            # Modal dialogs
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── TaskContext.tsx    # Task management state
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   └── useTasks.ts        # Task operations hook
│   ├── lib/                   # Utilities and helpers
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # Shared types
├── public/                    # Static assets
├── .env.local                 # Environment variables (not committed)
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # TailwindCSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

---

## Common Development Tasks

### Create a New Component

1. **Determine component type** (atom, molecule, organism)
2. **Create component file**:

```bash
# Example: Create a new Button atom
touch src/components/atoms/Button.tsx
```

3. **Implement component**:

```typescript
// src/components/atoms/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
}
```

4. **Export from index** (optional):

```typescript
// src/components/atoms/index.ts
export { Button } from './Button';
```

### Add a New Page

1. **Create page directory**:

```bash
mkdir -p src/app/new-page
```

2. **Create page component**:

```bash
touch src/app/new-page/page.tsx
```

3. **Implement page**:

```typescript
// src/app/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

4. **Access at**: http://localhost:3001/new-page

### Add API Integration

1. **Define types**:

```typescript
// src/types/index.ts
export interface NewEntity {
  id: number;
  name: string;
}
```

2. **Add API method**:

```typescript
// src/lib/api.ts
async function getNewEntities(): Promise<NewEntity[]> {
  const response = await apiClient.get<NewEntity[]>('/new-entities/');
  return response.data;
}

export const api = {
  // ... existing methods
  newEntities: {
    getAll: getNewEntities,
  },
};
```

3. **Use in component**:

```typescript
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

export function NewEntityList() {
  const [entities, setEntities] = useState([]);

  useEffect(() => {
    api.newEntities.getAll().then(setEntities);
  }, []);

  return <div>{/* render entities */}</div>;
}
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Specific Test File

```bash
npm test -- Button.test.tsx
```

### Test Coverage

```bash
npm test -- --coverage
```

**Coverage requirements**:
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

---

## Linting and Formatting

### Run ESLint

```bash
npm run lint
```

### Fix ESLint Issues

```bash
npm run lint -- --fix
```

### Format with Prettier

```bash
npm run format
```

### Pre-commit Checks

The project uses Git hooks to run checks before commits:
- ESLint validation
- Prettier formatting
- TypeScript type checking

---

## Building for Production

### Create Production Build

```bash
npm run build
```

**Expected output**:
```
- info Creating an optimized production build
- info Compiled successfully
- info Collecting page data
- info Generating static pages
- info Finalizing page optimization
```

### Test Production Build Locally

```bash
npm run start
```

Access at: http://localhost:3001

### Build Output

```
.next/
├── static/              # Static assets with hashes
├── server/              # Server-side code
└── cache/               # Build cache
```

---

## Troubleshooting

### Port Already in Use

**Error**: `Port 3001 is already in use`

**Solution**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (Windows)
taskkill /PID <process_id> /F

# Or use a different port
npm run dev -- -p 3002
```

### Backend Connection Failed

**Error**: `Network Error` or `ECONNREFUSED`

**Solution**:
1. Verify backend is running: `curl http://localhost:8001/`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Ensure no firewall blocking localhost connections

### Module Not Found

**Error**: `Cannot find module '@/components/...'`

**Solution**:
1. Check `tsconfig.json` has correct path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
2. Restart development server

### TypeScript Errors

**Error**: Type errors in components

**Solution**:
1. Run type check: `npm run type-check`
2. Check `tsconfig.json` configuration
3. Ensure all dependencies have type definitions

### TailwindCSS Not Working

**Error**: Styles not applied

**Solution**:
1. Check `tailwind.config.js` content paths:
```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
}
```
2. Verify `globals.css` imports Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
3. Restart development server

---

## Integration Testing Scenarios

### Scenario 1: Complete Authentication Flow

**Steps**:
1. Navigate to http://localhost:3001
2. Click "Get Started" → redirects to /signup
3. Fill signup form:
   - Email: test@example.com
   - Username: testuser
   - Password: Test1234!
4. Submit form → redirects to /dashboard
5. Verify user info in header
6. Click "Logout" → redirects to /signin

**Expected**: All steps complete without errors

### Scenario 2: Task Management Flow

**Steps**:
1. Login as existing user
2. Navigate to /dashboard
3. Click "Create Task" button
4. Fill task form:
   - Title: "Test Task"
   - Description: "This is a test"
5. Submit form → task appears in list
6. Click checkbox → task marked complete
7. Click "Edit" → form opens with task data
8. Update title → changes saved
9. Click "Delete" → confirmation dialog
10. Confirm → task removed

**Expected**: All operations succeed, UI updates correctly

### Scenario 3: User Isolation

**Steps**:
1. Register User A (userA@example.com)
2. Create task "User A Task"
3. Logout
4. Register User B (userB@example.com)
5. Navigate to dashboard
6. Verify User A's task is NOT visible

**Expected**: Users only see their own tasks

### Scenario 4: Error Handling

**Steps**:
1. Stop backend server
2. Try to login → shows network error
3. Start backend server
4. Try to login with invalid credentials → shows error message
5. Try to create task with empty title → shows validation error

**Expected**: All errors displayed clearly to user

---

## Performance Monitoring

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3001 --view
```

**Target scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### Bundle Size Analysis

```bash
npm run build
npm run analyze
```

**Target bundle sizes**:
- First Load JS: < 200 KB
- Total Size: < 500 KB

---

## Deployment Checklist

- [ ] All tests passing
- [ ] ESLint warnings resolved
- [ ] TypeScript errors resolved
- [ ] Environment variables configured for production
- [ ] API URL points to production backend
- [ ] Build succeeds without errors
- [ ] Production build tested locally
- [ ] Lighthouse scores meet targets
- [ ] Bundle size within limits
- [ ] HTTPS configured
- [ ] Error tracking configured (optional)

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run dev -- -p 3002   # Start on different port

# Building
npm run build            # Production build
npm run start            # Start production server

# Testing
npm test                 # Run tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage

# Code Quality
npm run lint             # Run ESLint
npm run lint -- --fix    # Fix ESLint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript check

# Dependencies
npm install              # Install all dependencies
npm install <package>    # Add new dependency
npm update               # Update dependencies
npm audit                # Check for vulnerabilities
```

---

## Getting Help

### Documentation

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Better Auth**: https://better-auth.com/docs

### Common Issues

Check the project's GitHub issues or internal documentation for solutions to common problems.

### Team Communication

- Report bugs with reproduction steps
- Include error messages and screenshots
- Mention browser and OS version
- Share relevant code snippets
