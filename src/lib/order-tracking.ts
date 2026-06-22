import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "./db";

export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeOrderNumber(orderNumber: string): string {
  return orderNumber.trim().toUpperCase();
}

export function buildOrderTrackWhere(
  orderNumber: string,
  contact: { phone?: string; email?: string }
): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {
    orderNumber: normalizeOrderNumber(orderNumber),
  };

  if (contact.phone) {
    where.phone = normalizePhone(contact.phone);
  } else if (contact.email) {
    where.email = normalizeEmail(contact.email);
  }

  return where;
}

export async function recordOrderStatusHistory(
  orderId: string,
  status: OrderStatus,
  note?: string
) {
  const last = await prisma.orderStatusHistory.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  if (last?.status === status && last.note === (note ?? null)) {
    return last;
  }

  return prisma.orderStatusHistory.create({
    data: { orderId, status, note: note ?? null },
  });
}

export const ORDER_TRACKING_STEPS: OrderStatus[] = [
  "SIPARIS_ALINDI",
  "ODEME_BEKLENIYOR",
  "ODEME_BILDIRILDI",
  "ODEME_ONAYLANDI",
  "HAZIRLANIYOR",
  "KARGOYA_VERILDI",
  "TESLIM_EDILDI",
];
