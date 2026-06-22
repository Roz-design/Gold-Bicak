import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { execSync } from "node:child_process";

export const dynamic = "force-dynamic";

function getSetupSecret() {
  return process.env.SETUP_SECRET || process.env.JWT_SECRET || "";
}

export async function POST(request: NextRequest) {
  const expected = getSetupSecret();
  const provided =
    request.headers.get("x-setup-secret") ||
    request.nextUrl.searchParams.get("secret") ||
    "";

  if (!expected || provided !== expected) {
    return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
  }

  const [productCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
  ]);

  if (productCount > 0 && userCount > 0) {
    return NextResponse.json({
      ok: true,
      message: "Veritabanı zaten dolu",
      productCount,
      userCount,
    });
  }

  execSync("npx tsx prisma/seed.ts", { stdio: "pipe", env: process.env });

  return NextResponse.json({
    ok: true,
    message: "Seed tamamlandı",
    admin: "Admin / Rozerin21.",
  });
}
