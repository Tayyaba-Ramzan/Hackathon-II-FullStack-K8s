/**
 * Better Auth configuration with JWT plugin
 *
 * Note: This is a minimal configuration for Better Auth.
 * The actual JWT token management is handled by our backend API.
 */

import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // Basic configuration for Better Auth
  // JWT tokens are managed by the backend API
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
});

export type Auth = typeof auth;
