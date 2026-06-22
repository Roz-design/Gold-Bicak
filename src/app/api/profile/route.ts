import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, hashPassword, verifyPassword } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        tcKimlik: true,
        phone: true,
        email: true,
        createdAt: true,
        addresses: true,
      },
    });
    return apiSuccess(profile);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const { firstName, lastName, phone, email } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone: phone.replace(/\D/g, "") }),
        ...(email && { email }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    });

    return apiSuccess(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return apiError("Mevcut ve yeni şifre zorunludur", 400);
    }

    if (newPassword.length < 6) {
      return apiError("Yeni şifre en az 6 karakter olmalıdır", 400);
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !(await verifyPassword(currentPassword, dbUser.passwordHash))) {
      return apiError("Mevcut şifre hatalı", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return apiSuccess({ message: "Şifre güncellendi" });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return apiError("Giriş yapmanız gerekiyor", 401);
    }
    return apiError("Bir hata oluştu", 500);
  }
}
