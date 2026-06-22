import { config } from "dotenv";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

config();

const dbUrl = (process.env.DATABASE_URL ?? "").trim();

function isPostgresUrl(url) {
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

async function main() {
  if (!isPostgresUrl(dbUrl)) {
    console.log("[seed] PostgreSQL yok — seed atlandı.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    const [productCount, userCount] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
    ]);

    if (productCount > 0 && userCount > 0) {
      console.log("[seed] Veritabanı dolu — seed atlandı.");
      return;
    }

    console.log("[seed] Veritabanı boş — örnek veriler yükleniyor...");
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env });
    console.log("[seed] Tamamlandı.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[seed] HATA:", error);
  process.exit(1);
});
