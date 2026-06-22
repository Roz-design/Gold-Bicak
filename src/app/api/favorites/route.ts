import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireAuth();
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    });
    return apiSuccess(favorites);
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
    if (!body?.productId) return apiError("Ürün ID zorunludur", 400);

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_productId: { userId: user.id, productId: body.productId },
      },
      update: {},
      create: { userId: user.id, productId: body.productId },
    });

    return apiSuccess(favorite, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
