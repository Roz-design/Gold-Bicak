import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        phoneVerified: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(users);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    if (e instanceof Error && e.message === "UNAUTHORIZED") return apiError("Giriş yapmanız gerekiyor", 401);
    return apiError("Bir hata oluştu", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    if (!body?.userId || !body?.status) return apiError("Geçersiz istek", 400);

    const user = await prisma.user.update({
      where: { id: body.userId },
      data: { status: body.status },
    });

    await logAdminAction(
      admin.id,
      "USER_STATUS_UPDATE",
      `Kullanıcı ${body.userId} durumu: ${body.status}`,
      getClientIp(request)
    );

    return apiSuccess(user);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}
