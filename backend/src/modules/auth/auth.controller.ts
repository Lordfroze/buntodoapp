import Elysia from "elysia";
import { z } from "zod";
import { register, login, getCurrentUser } from "./auth.service";
import { env } from "../../lib/env";
import { unauthorized } from "../../lib/http";
import { getSessionToken } from "../../middleware/auth";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().max(255, "Email is too long").email("Invalid email format").toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password is too long"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required").max(72, "Password is too long"),
});

function buildCookie(value: string, maxAge: number): string {
  const parts = [
    `${env.COOKIE_NAME}=${value}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `HttpOnly`,
    `SameSite=${env.COOKIE_SAME_SITE}`,
  ];
  if (env.COOKIE_SECURE) parts.push("Secure");
  return parts.join("; ");
}

function setSessionCookie(set: any, token: string): void {
  set.headers["set-cookie"] = buildCookie(token, env.COOKIE_MAX_AGE_SECONDS);
}

function clearSessionCookie(set: any): void {
  set.headers["set-cookie"] = buildCookie("", 0);
}

export const authController = new Elysia({ prefix: "/api/auth" })
  .post(
    "/register",
    async ({ body, set }) => {
      const input = registerSchema.parse(body);
      const { user, token } = await register(input);
      setSessionCookie(set, token);
      set.status = 201;
      return { success: true, data: user };
    },
    { detail: { description: "Register a new user account" } }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      const input = loginSchema.parse(body);
      const { user, token } = await login(input);
      setSessionCookie(set, token);
      set.status = 200;
      return { success: true, data: user };
    },
    { detail: { description: "Login with email and password" } }
  )
  .post(
    "/logout",
    ({ set }) => {
      clearSessionCookie(set);
      return { success: true, message: "Logged out successfully" };
    },
    { detail: { description: "Logout current user" } }
  )
  .get(
    "/me",
    async ({ request, set }) => {
      const token = getSessionToken(request);
      const user = token ? await getCurrentUser(token) : null;
      if (!user) {
        throw unauthorized("Not authenticated");
      }
      return { success: true, data: user };
    },
    { detail: { description: "Get current logged in user" } }
  );
