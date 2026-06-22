import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await requireAuth();
    const { productId } = await params;

    await prisma.favorite.deleteMany({
      where: { userId: user.id, productId },
    });

    return apiSuccess({ message: "Favorilerden kaldırıldı" });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
