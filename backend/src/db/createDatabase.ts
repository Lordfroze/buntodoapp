import { createConnection } from "mysql2/promise";
import { env } from "../lib/env";

/**
 * Creates the target database when it does not exist yet.
 * Tables are NOT created here - they always come from Drizzle migrations
 * (`bun run db:migrate`).
 */
async function main() {
  const conn = await createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`✅ Database "${env.DB_NAME}" is ready.`);
  await conn.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Could not create database:", err);
  process.exit(1);
});
