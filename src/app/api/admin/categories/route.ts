import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return apiSuccess(categories);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    if (!body?.name) return apiError("Kategori adı zorunludur", 400);

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: slugify(body.name),
        description: body.description || "",
        image: body.image || null,
        sortOrder: body.sortOrder || 0,
        active: body.active !== false,
      },
    });

    await logAdminAction(admin.id, "CATEGORY_CREATE", category.name, getClientIp(request));
    return apiSuccess(category, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}
