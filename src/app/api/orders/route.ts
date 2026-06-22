import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { generateOrderNumber, getUnitPrice, validateTcKimlik } from "@/lib/utils";
import { normalizeEmail, normalizePhone, recordOrderStatusHistory } from "@/lib/order-tracking";

export async function GET() {
  try {
    const user = await requireAuth();
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        paymentNotification: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(orders);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const {
      customerName,
      tcKimlik,
      phone,
      email,
      shippingAddress,
      city,
      district,
      postalCode,
      orderNote,
    } = body;

    const required = [
      customerName,
      tcKimlik,
      phone,
      email,
      shippingAddress,
      city,
      district,
      postalCode,
    ];

    if (required.some((f) => !f)) {
      return apiError("Tüm zorunlu alanları doldurunuz", 400);
    }

    if (!validateTcKimlik(tcKimlik)) {
      return apiError("Geçersiz T.C. Kimlik Numarası", 400);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return apiError("Sepetiniz boş", 400);
    }

    let totalAmount = 0;
    const orderItems = cartItems.map((item) => {
      const unitPrice = getUnitPrice(item.product, item.saleType);
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;
      return {
        productId: item.productId,
        productName: item.product.name,
        productCode: item.product.code,
        saleType: item.saleType,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,
          status: "ODEME_BEKLENIYOR",
          customerName,
          tcKimlik,
          phone: normalizePhone(phone),
          email: normalizeEmail(email),
          shippingAddress,
          city,
          district,
          postalCode,
          orderNote: orderNote || null,
          totalAmount,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    await recordOrderStatusHistory(order.id, "ODEME_BEKLENIYOR", "Sipariş oluşturuldu");

    return apiSuccess(order, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
