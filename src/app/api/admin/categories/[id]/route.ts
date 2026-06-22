import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const { name, description, image, sortOrder, active } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image: image || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(active !== undefined && { active }),
      },
    });

    await logAdminAction(admin.id, "CATEGORY_UPDATE", category.name, getClientIp(request));
    return apiSuccess(category);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) return apiError("Bu kategoride ürün var, silinemez", 400);

    const category = await prisma.category.delete({ where: { id } });
    await logAdminAction(admin.id, "CATEGORY_DELETE", category.name, getClientIp(request));
    return apiSuccess({ message: "Kategori silindi" });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}
