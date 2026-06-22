import { PrismaClient as PostgresPrismaClient } from "@prisma/client";
import { PrismaClient as SqlitePrismaClient } from "@/generated/sqlite";

const globalForPrisma = globalThis as unknown as {
  prisma: PostgresPrismaClient | SqlitePrismaClient | undefined;
};

function isSqliteDatabaseUrl(url: string | undefined) {
  return (url ?? "").startsWith("file:");
}

function createPrismaClient() {
  const useSqlite = isSqliteDatabaseUrl(process.env.DATABASE_URL);
  const Client = useSqlite ? SqlitePrismaClient : PostgresPrismaClient;

  return new Client({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

export default prisma;
