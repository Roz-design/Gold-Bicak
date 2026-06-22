import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  buildOrderTrackWhere,
  normalizeEmail,
  normalizeOrderNumber,
  normalizePhone,
} from "@/lib/order-tracking";
import { getOrderStatusLabel } from "@/lib/utils";

function formatTrackResponse(order: {
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  trackingNumber: string | null;
  carrierName: string | null;
  trackingUrl: string | null;
  city: string;
  district: string;
  items: Array<{
    productName: string;
    saleType: string;
    quantity: number;
    totalPrice: number;
  }>;
  statusHistory: Array<{
    status: string;
    note: string | null;
    createdAt: Date;
  }>;
  paymentNotification: { createdAt: Date } | null;
}) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: getOrderStatusLabel(order.status),
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    trackingNumber: order.trackingNumber,
    carrierName: order.carrierName,
    trackingUrl: order.trackingUrl,
    shipping: {
      city: order.city,
      district: order.district,
    },
    paymentReported: Boolean(order.paymentNotification),
    items: order.items.map((item) => ({
      productName: item.productName,
      saleType: item.saleType,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    })),
    timeline: order.statusHistory.map((entry) => ({
      status: entry.status,
      statusLabel: getOrderStatusLabel(entry.status),
      note: entry.note,
      createdAt: entry.createdAt,
    })),
  };
}

async function trackOrder(request: NextRequest, body?: Record<string, unknown>) {
  const ip = getClientIp(request) || "unknown";
  const rate = checkRateLimit(`track:${ip}`, 15, 60_000);
  if (!rate.allowed) {
    return apiError(`Çok fazla deneme. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`, 429);
  }

  const orderNumberRaw =
    (body?.orderNumber as string | undefined) ||
    new URL(request.url).searchParams.get("orderNumber") ||
    "";
  const phoneRaw =
    (body?.phone as string | undefined) ||
    new URL(request.url).searchParams.get("phone") ||
    "";
  const emailRaw =
    (body?.email as string | undefined) ||
    new URL(request.url).searchParams.get("email") ||
    "";

  const orderNumber = normalizeOrderNumber(orderNumberRaw);
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";
  const email = emailRaw ? normalizeEmail(emailRaw) : "";

  if (!orderNumber) {
    return apiError("Sipariş numarası zorunludur", 400);
  }

  if (!phone && !email) {
    return apiError("Telefon veya e-posta zorunludur", 400);
  }

  const order = await prisma.order.findFirst({
    where: buildOrderTrackWhere(orderNumber, {
      phone: phone || undefined,
      email: email || undefined,
    }),
    include: {
      items: true,
      paymentNotification: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) {
    return apiError("Sipariş bulunamadı. Bilgilerinizi kontrol edin.", 404);
  }

  return apiSuccess(formatTrackResponse(order));
}

export async function GET(request: NextRequest) {
  return trackOrder(request);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Geçersiz istek", 400);
  return trackOrder(request, body);
}
