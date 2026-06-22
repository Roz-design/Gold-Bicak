import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireAuth();
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });
    return apiSuccess(addresses);
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

    const { title, fullName, phone, address, city, district, postalCode, isDefault } = body;

    if (!title || !fullName || !phone || !address || !city || !district || !postalCode) {
      return apiError("Tüm alanlar zorunludur", 400);
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        title,
        fullName,
        phone,
        address,
        city,
        district,
        postalCode,
        isDefault: isDefault || false,
      },
    });

    return apiSuccess(newAddress, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
