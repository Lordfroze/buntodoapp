import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  schema,
  mode: "default",
});

export * from "./schema";