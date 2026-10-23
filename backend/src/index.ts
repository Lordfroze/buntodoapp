import Elysia from "elysia";
import { ZodError } from "zod";
import { cors } from "@elysiajs/cors";
import { authController } from "./modules/auth/auth.controller";
import { todosController } from "./modules/todos/todos.controller";
import { authMiddleware } from "./middleware/auth";
import { env, isProduction } from "./lib/env";
import { HttpError } from "./lib/http";

const app = new Elysia()
  .use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    })
  )
  .use(authMiddleware)
  .use(authController)
  .use(todosController)
  .get("/", () => ({
    name: "TodoApp Backend",
    status: "running",
    version: "1.0.0",
  }))
  .onError(({ code, error, set }) => {
    // Thrown with an explicit HTTP status (401, 404, 409, ...).
    if (error instanceof HttpError) {
      set.status = error.status;
      return error.details !== undefined
        ? { success: false, error: error.message, details: error.details }
        : { success: false, error: error.message };
    }

    // Input validation performed with Zod in the controllers.
    if (error instanceof ZodError) {
      set.status = 400;
      const details = error.flatten().fieldErrors;
      const firstMessage =
        Object.values(details).flat().find((message) => typeof message === "string") ??
        "Validation failed";
      return { success: false, error: firstMessage, details };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      const details = (error as unknown as { allErrors?: unknown }).allErrors;
      return { success: false, error: "Validation failed", ...(details ? { details } : {}) };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, error: "Route not found" };
    }

    if (code === "PARSE") {
      set.status = 400;
      return { success: false, error: "Invalid request body" };
    }

    // Anything else is unexpected - log it, never leak internals to the client.
    console.error("[api] unhandled error:", error);
    set.status = 500;
    return { success: false, error: "Internal server error" };
  })
  .listen(env.PORT);

console.log(`\n🚀 TodoApp Backend running on http://localhost:${env.PORT}`);
console.log(`   Allowed origin: ${env.FRONTEND_URL}`);
if (!isProduction && env.JWT_SECRET === "dev_secret_change_me") {
  console.warn("   ⚠️  Using the default JWT_SECRET. Set JWT_SECRET in .env before deploying.");
}

export type App = typeof app;
