import { hash } from "bcryptjs";
import { createClient } from "@libsql/client";
import { SCHEMA_SQL } from "../src/lib/schema";
import { loadEnvLocal, resolveSqliteUrl } from "./env";

loadEnvLocal();

async function main() {
  const url = resolveSqliteUrl();
  const db = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
  for (const statement of statements) {
    await db.execute(statement);
  }

  const adminEmail = "admin@grabstudent.edu";
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [adminEmail],
  });

  if (existing.rows.length === 0) {
    const password_hash = await hash("Admin123!", 10);
    const now = new Date().toISOString();
    await db.execute({
      sql: `INSERT INTO users
            (id, name, email, password_hash, student_number, role, status, student_id_doc, license_doc, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'admin', 'approved', NULL, NULL, ?, ?)`,
      args: [
        crypto.randomUUID(),
        "Platform Admin",
        adminEmail,
        password_hash,
        "ADMIN-0001",
        now,
        now,
      ],
    });
    console.log("Seeded admin: admin@grabstudent.edu / Admin123!");
  } else {
    console.log("Admin already exists.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
