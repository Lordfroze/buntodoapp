import { config } from "dotenv";
import { resolve } from "path";

// Bun also auto-loads `.env`, but running via `bun run src/...` can be started
// from another working directory, so we load it explicitly as well.
config({ path: resolve(process.cwd(), ".env") });

export const env = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_NAME: process.env.DB_NAME || "todoapp",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret_change_me",
  COOKIE_NAME: process.env.COOKIE_NAME || "session_id",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE || "lax") as "lax" | "strict" | "none",
  COOKIE_MAX_AGE_SECONDS: Number(process.env.COOKIE_MAX_AGE_SECONDS) || 60 * 60 * 24 * 7,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
};

export const isProduction = env.NODE_ENV === "production";
