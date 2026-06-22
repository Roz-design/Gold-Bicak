import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { verifyPhoneCode } from "@/lib/sms";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Geçersiz istek", 400);

  const { phone, code } = body;
  if (!phone || !code) return apiError("Telefon ve kod zorunludur", 400);

  const normalizedPhone = phone.replace(/\D/g, "");
  const verified = await verifyPhoneCode(normalizedPhone, code);

  if (!verified) {
    return apiError("Geçersiz veya süresi dolmuş doğrulama kodu", 400);
  }

  const user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });

  if (!user) return apiError("Kullanıcı bulunamadı", 404);

  const token = signToken({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    phoneVerified: true,
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
