import { config } from "dotenv";
import { execSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const envLocalPath = resolve(process.cwd(), ".env.local");
const devDbPath = resolve(process.cwd(), "prisma/dev.db");
const databaseUrl = (process.env.DATABASE_URL ?? "").trim().replace(/^["']|["']$/g, "");

function isUsablePostgresUrl(url) {
  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    return false;
  }
  if (url.includes("USER:PASSWORD") || url.includes("ep-xxx") || url.includes("@ep-xxx")) {
    return false;
  }
  return true;
}

function sqliteDatabaseUrl() {
  const absolutePath = devDbPath.replace(/\\/g, "/");
  return `file:${absolutePath}`;
}

function run(command) {
  execSync(command, { stdio: "inherit", env: process.env });
}

if (isUsablePostgresUrl(databaseUrl)) {
  console.log("[dev] PostgreSQL bağlantısı kullanılıyor.");
  if (existsSync(envLocalPath)) unlinkSync(envLocalPath);
} else {
  console.log("[dev] Yerel SQLite kullanılıyor (prisma/dev.db).");
  console.log("[dev] Neon kullanmak için .env içine gerçek DATABASE_URL yapıştırın.");

  const sqliteUrl = sqliteDatabaseUrl();
  writeFileSync(envLocalPath, `DATABASE_URL="${sqliteUrl}"\n`, "utf8");
  process.env.DATABASE_URL = sqliteUrl;

  const sqliteClientPath = resolve(process.cwd(), "src/generated/sqlite");
  if (!existsSync(sqliteClientPath)) {
    console.log("[dev] SQLite istemcisi oluşturuluyor (bir kez)...");
    run("npx prisma generate --schema prisma/schema.sqlite.prisma");
  }

  if (!existsSync(devDbPath)) {
    console.log("[dev] İlk kurulum: veritabanı oluşturuluyor...");
    run("npx prisma db push --schema prisma/schema.sqlite.prisma --skip-generate");
    console.log("[dev] Örnek veriler yükleniyor...");
    run("npx tsx prisma/seed.ts");
  }
}
