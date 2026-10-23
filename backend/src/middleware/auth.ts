import Elysia from "elysia";
import { env } from "../lib/env";
import { getCurrentUser, UserResponse } from "../modules/auth/auth.service";

/** Parse the `Cookie` request header into a simple name -> value map. */
function parseCookies(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((pair: string) => {
    const idx = pair.indexOf("=");
    if (idx > -1) {
      cookies[pair.substring(0, idx).trim()] = pair.substring(idx + 1).trim();
    }
  });
  return cookies;
}

/** Extract the raw session token from the request's Cookie header. */
export function getSessionToken(request: Request): string | null {
  return parseCookies(request)[env.COOKIE_NAME] || null;
}

/** Resolve the authenticated user for a request, or `null` when logged out. */
export async function getUserFromRequest(request: Request): Promise<UserResponse | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  return await getCurrentUser(token);
}

/**
 * Derives `user` on every route. `user` is `null` for anonymous requests;
 * protected routes must still guard against `null` explicitly.
 */
export const authMiddleware = new Elysia().derive(async ({ request }) => {
  return { user: await getUserFromRequest(request) };
});
