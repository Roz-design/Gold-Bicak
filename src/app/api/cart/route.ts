import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { getUnitPrice } from "@/lib/utils";
import type { SaleType } from "@prisma/client";

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    });

    const cartItems = items.map((item) => {
      const unitPrice = getUnitPrice(item.product, item.saleType);
      return {
        ...item,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return apiSuccess({ items: cartItems, total });
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

    const { productId, saleType, quantity = 1 } = body;
    if (!productId || !saleType) {
      return apiError("Ürün ve satış tipi zorunludur", 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.hidden) return apiError("Ürün bulunamadı", 404);
    if (product.stock <= 0) return apiError("Ürün stokta yok", 400);

    const validTypes: SaleType[] = ["ADET", "PAKET", "KOLI"];
    if (!validTypes.includes(saleType)) {
      return apiError("Geçersiz satış tipi", 400);
    }

    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId_saleType: {
          userId: user.id,
          productId,
          saleType,
        },
      },
      update: { quantity: { increment: quantity } },
      create: { userId: user.id, productId, saleType, quantity },
      include: {
        product: {
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
      },
    });

    return apiSuccess(item, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    return apiSuccess({ message: "Sepet temizlendi" });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
