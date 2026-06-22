import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  signToken,
  setAuthCookie,
  findUserByLoginIdentifier,
} from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Geçersiz istek", 400);

  const login = String(body.login || body.email || "").trim();
  const password = body.password;
  if (!login || !password) {
    return apiError("Kullanıcı adı/e-posta ve şifre zorunludur", 400);
  }

  const user = await findUserByLoginIdentifier(login);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return apiError("Kullanıcı adı/e-posta veya şifre hatalı", 401);
  }

  if (user.status === "BLOCKED") {
    return apiError("Hesabınız engellenmiştir", 403);
  }

  if (user.status === "INACTIVE") {
    return apiError("Hesabınız pasif durumdadır", 403);
  }

  if (!user.phoneVerified && user.role !== "ADMIN") {
    return apiError("Telefon doğrulaması yapılmamış. Lütfen kayıt işlemini tamamlayın.", 403);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    phoneVerified: user.phoneVerified,
  });

  await setAuthCookie(token);

  return apiSuccess({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
}
