import { eq } from "drizzle-orm";
import { db, users } from "../../db";
import { v4 as uuidv4 } from "uuid";
import { SignJWT, jwtVerify } from "jose";
import { env } from "../../lib/env";
import { conflict, unauthorized } from "../../lib/http";

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: UserResponse;
  /** Raw session token - only ever written to an HttpOnly cookie. */
  token: string;
}

async function createSessionToken(user: { id: string; email: string }): Promise<string> {
  const secretKey = new TextEncoder().encode(env.JWT_SECRET);
  return new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; errno?: number; message?: string };
  return (
    err.code === "ER_DUP_ENTRY" ||
    err.errno === 1062 ||
    (typeof err.message === "string" && err.message.toLowerCase().includes("duplicate"))
  );
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    throw conflict("Email already registered");
  }

  // bcrypt via Bun's native implementation - no plaintext, no extra dependency.
  const passwordHash = await Bun.password.hash(input.password, "bcrypt");
  const id = uuidv4();

  try {
    await db.insert(users).values({
      id,
      name: input.name.trim(),
      email,
      passwordHash,
    });
  } catch (error) {
    // Unique constraint (email) lost a race between the SELECT and INSERT.
    if (isDuplicateKeyError(error)) {
      throw conflict("Email already registered");
    }
    throw error;
  }

  const token = await createSessionToken({ id, email });

  return {
    user: { id, name: input.name.trim(), email, createdAt: new Date() },
    token,
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user) {
    throw unauthorized("Email tidak terdaftar");
  }

  const valid = await Bun.password.verify(input.password, user.passwordHash);
  if (!valid) {
    throw unauthorized("Password salah");
  }

  const token = await createSessionToken({ id: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function getCurrentUser(token: string): Promise<UserResponse | null> {
  if (!token) return null;
  try {
    const secretKey = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.sub) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}
