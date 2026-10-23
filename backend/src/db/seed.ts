import { eq } from "drizzle-orm";
import { db, users, todos } from "./index";

const DEMO_EMAIL = "demo@example.com";

async function main() {
  const passwordHash = await Bun.password.hash("password123", "bcrypt");

  let user = await db.query.users.findFirst({ where: eq(users.email, DEMO_EMAIL) });
  if (!user) {
    const [inserted] = await db
      .insert(users)
      .values({ name: "Demo User", email: DEMO_EMAIL, passwordHash })
      .$returningId();
    user = await db.query.users.findFirst({ where: eq(users.id, inserted.id) });
    if (!user) throw new Error("Failed to create demo user");
    console.log(`✅ Created demo user ${DEMO_EMAIL} / password123`);
  } else {
    console.log(`ℹ️  Demo user ${DEMO_EMAIL} already exists.`);
  }

  const existingTodos = await db.query.todos.findMany({ where: eq(todos.userId, user.id) });
  if (existingTodos.length === 0) {
    await db.insert(todos).values([
      { userId: user.id, title: "Membaca dokumentasi ElysiaJS", description: "Pelajari routing & middleware", isCompleted: true },
      { userId: user.id, title: "Setup Drizzle ORM + MySQL", description: "Buat schema dan jalankan migration", isCompleted: true },
      { userId: user.id, title: "Bangun halaman Dashboard", isCompleted: false },
      { userId: user.id, title: "Uji autentikasi & isolasi data", isCompleted: false },
    ]);
    console.log("✅ Demo todos created.");
  } else {
    console.log("ℹ️  Demo todos already exist.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
