import { NextRequest } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";
import { recordOrderStatusHistory } from "@/lib/order-tracking";
import { sendOrderStatusSms } from "@/lib/sms";
import { getOrderStatusLabel } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const status = new URL(request.url).searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
        paymentNotification: true,
        statusHistory: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(orders);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    if (!body?.orderId) return apiError("Sipariş ID zorunludur", 400);

    const { orderId, status, trackingNumber, carrierName, trackingUrl } = body;

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) return apiError("Sipariş bulunamadı", 404);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status: status as OrderStatus }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(carrierName !== undefined && { carrierName }),
        ...(trackingUrl !== undefined && { trackingUrl }),
      },
      include: { user: true },
    });

    if (status && status !== existing.status) {
      await recordOrderStatusHistory(
        order.id,
        status as OrderStatus,
        getOrderStatusLabel(status)
      );
      await sendOrderStatusSms(
        order.phone,
        order.orderNumber,
        getOrderStatusLabel(status)
      );
    }

    if (
      trackingNumber !== undefined &&
      trackingNumber &&
      trackingNumber !== existing.trackingNumber
    ) {
      await recordOrderStatusHistory(
        order.id,
        order.status,
        `Kargo takip no: ${trackingNumber}`
      );
      await sendOrderStatusSms(
        order.phone,
        order.orderNumber,
        `Kargo takip numaranız: ${trackingNumber}`
      );
    }

    await logAdminAction(
      admin.id,
      "ORDER_UPDATE",
      `Sipariş ${order.orderNumber}: ${status || "kargo bilgisi güncellendi"}`,
      getClientIp(request)
    );

    return apiSuccess(order);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}
