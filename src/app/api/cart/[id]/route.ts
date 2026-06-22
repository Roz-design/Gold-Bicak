import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const { quantity } = body;
    if (!quantity || quantity < 1) {
      return apiError("Geçerli bir miktar giriniz", 400);
    }

    const item = await prisma.cartItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!item) return apiError("Sepet öğesi bulunamadı", 404);

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return apiSuccess(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const item = await prisma.cartItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!item) return apiError("Sepet öğesi bulunamadı", 404);

    await prisma.cartItem.delete({ where: { id } });
    return apiSuccess({ message: "Ürün sepetten kaldırıldı" });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
