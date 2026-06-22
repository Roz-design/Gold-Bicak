import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { recordOrderStatusHistory } from "@/lib/order-tracking";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
    });

    if (!order) return apiError("Sipariş bulunamadı", 404);

    if (order.status !== "ODEME_BEKLENIYOR") {
      return apiError("Bu sipariş için ödeme bildirimi yapılamaz", 400);
    }

    const existing = await prisma.paymentNotification.findUnique({
      where: { orderId: id },
    });

    if (existing) return apiError("Ödeme bildirimi zaten yapılmış", 400);

    const { description, transferDate, receiptUrl } = body;

    await prisma.$transaction([
      prisma.paymentNotification.create({
        data: {
          orderId: id,
          description: description || null,
          transferDate: transferDate ? new Date(transferDate) : new Date(),
          receiptUrl: receiptUrl || null,
        },
      }),
      prisma.order.update({
        where: { id },
        data: { status: "ODEME_BILDIRILDI" },
      }),
    ]);

    await recordOrderStatusHistory(id, "ODEME_BILDIRILDI", "Ödeme bildirimi alındı");

    return apiSuccess({ message: "Ödeme bildirimi alındı" });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
