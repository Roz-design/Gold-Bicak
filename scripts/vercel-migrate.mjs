import { execSync } from "node:child_process";

const dbUrl = process.env.DATABASE_URL ?? "";

if (!dbUrl.startsWith("postgres")) {
  console.warn("[migrate] DATABASE_URL PostgreSQL değil — migrate atlanıyor (lokal geliştirme).");
  process.exit(0);
}

function resolveMigrateUrl() {
  if (process.env.DIRECT_URL) {
    return process.env.DIRECT_URL;
  }

  // Neon pooled URL → direct URL (migrate pooled bağlantıda çalışmaz)
  if (dbUrl.includes("-pooler.")) {
    return dbUrl.replace("-pooler.", ".");
  }

  return dbUrl;
}

const migrateUrl = resolveMigrateUrl();

console.log("[migrate] Veritabanı şeması uygulanıyor...");
execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: migrateUrl },
});
