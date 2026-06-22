import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: {
        items: { include: { product: { include: { images: true } } } },
        paymentNotification: true,
      },
    });

    if (!order) return apiError("Sipariş bulunamadı", 404);
    return apiSuccess(order);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
