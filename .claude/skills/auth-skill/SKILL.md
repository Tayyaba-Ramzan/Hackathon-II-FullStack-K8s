---
name: auth-skill
description: Handle secure authentication flows – signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Auth Skill

## Instructions

1. **Signup Flow**
   - Collect user email and password
   - Hash password securely (bcrypt or equivalent)
   - Validate unique email before creating user
   - Store hashed password in database

2. **Signin Flow**
   - Verify email exists
   - Compare entered password with hashed password
   - Generate JWT token upon successful login
   - Send token via secure cookies or response header

3. **JWT Token Management**
   - Set short-lived access tokens
   - Optionally set refresh tokens for session renewal
   - Validate tokens on protected routes
   - Handle token expiration gracefully

4. **Better Auth Integration**
   - Use Better Auth SDK for additional authentication features
   - Configure social logins if required
   - Integrate multi-factor authentication (MFA) if needed

5. **Security Best Practices**
   - Never store plaintext passwords
   - Use environment variables for secrets
   - Protect sensitive routes and data
   - Return generic error messages to prevent information leaks

## Example Flow

```ts
// Signup Example
import { hashPassword } from 'auth-utils';
import { createUser } from './db';

async function signup(email: string, password: string) {
  const hashed = await hashPassword(password);
  await createUser({ email, password: hashed });
}

// Signin Example
import { verifyPassword, generateJWT } from 'auth-utils';
import { findUserByEmail } from './db';

async function signin(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  return generateJWT(user.id);
}