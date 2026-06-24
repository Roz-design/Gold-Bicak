import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const hasDatabaseUrl =
    databaseUrl.startsWith("postgres") || databaseUrl.startsWith("file:");

  if (!hasDatabaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        database: "missing_url",
        message: "DATABASE_URL tanımlı değil",
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const kind = databaseUrl.startsWith("file:") ? "sqlite" : "postgresql";
    const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
    return NextResponse.json({ ok: true, database: "connected", kind, blobConfigured });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "connection_failed",
        message: error instanceof Error ? error.message : "Bağlantı hatası",
      },
      { status: 503 }
    );
  }
}
