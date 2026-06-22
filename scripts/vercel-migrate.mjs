import { config } from "dotenv";
import { execSync } from "node:child_process";

config();

function cleanEnvUrl(value) {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

const isVercel = process.env.VERCEL === "1";
const dbUrl = cleanEnvUrl(process.env.DATABASE_URL);

function isPostgresUrl(url) {
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

if (!isPostgresUrl(dbUrl)) {
  if (isVercel) {
    console.error(
      "[migrate] HATA: Vercel'de DATABASE_URL tanımlı değil veya PostgreSQL değil.\n" +
        "Neon → Connect → Pooled connection string'i Vercel Environment Variables'a ekleyin."
    );
    process.exit(1);
  }
  console.warn("[migrate] DATABASE_URL PostgreSQL değil — migrate atlanıyor (lokal geliştirme).");
  process.exit(0);
}

function resolveMigrateUrl() {
  const direct = cleanEnvUrl(process.env.DIRECT_URL);
  if (direct && isPostgresUrl(direct)) {
    return direct;
  }

  if (dbUrl.includes("-pooler.")) {
    return dbUrl.replace("-pooler.", ".");
  }

  try {
    const url = new URL(dbUrl);
    if (url.searchParams.get("pgbouncer") === "true") {
      url.searchParams.delete("pgbouncer");
      return url.toString();
    }
  } catch {
    // keep original url
  }

  return dbUrl;
}

function runPrisma(command, databaseUrl) {
  execSync(command, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

const migrateUrl = resolveMigrateUrl();

console.log("[migrate] Veritabanı şeması uygulanıyor...");

try {
  runPrisma("npx prisma migrate deploy", migrateUrl);
  console.log("[migrate] migrate deploy tamamlandı.");
} catch (migrateError) {
  console.warn("[migrate] migrate deploy başarısız, db push deneniyor...");
  try {
    runPrisma("npx prisma db push --skip-generate --accept-data-loss", migrateUrl);
    console.log("[migrate] db push tamamlandı.");
  } catch (pushError) {
    console.error(
      "[migrate] HATA: Veritabanı şeması uygulanamadı.\n" +
        "- DATABASE_URL Neon pooled URL mi?\n" +
        "- İsteğe bağlı DIRECT_URL ekleyin (Neon direct connection)\n" +
        "- Neon projesinin aktif olduğundan emin olun"
    );
    process.exit(1);
  }
}

try {
  execSync("node scripts/seed-if-empty.mjs", { stdio: "inherit", env: process.env });
} catch (seedError) {
  console.error("[migrate] Seed başarısız — deploy devam ediyor olabilir; npm run db:seed ile manuel deneyin.");
}
