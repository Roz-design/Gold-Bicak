import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isSqliteDatabaseUrl(url: string | undefined) {
  return (url ?? "").startsWith("file:");
}

function createSqliteClient(log: Prisma.LogLevel[]): PrismaClient {
  // Yerel geliştirmede oluşturulur; Vercel'de bu dal çalışmaz.
  const { PrismaClient: SqlitePrismaClient } = require("@/generated/sqlite") as {
    PrismaClient: new (options?: { log?: Prisma.LogLevel[] }) => PrismaClient;
  };

  return new SqlitePrismaClient({ log }) as unknown as PrismaClient;
}

function createPrismaClient(): PrismaClient {
  const log: Prisma.LogLevel[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  if (isSqliteDatabaseUrl(process.env.DATABASE_URL)) {
    return createSqliteClient(log);
  }

  return new PrismaClient({ log });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

export default prisma;
