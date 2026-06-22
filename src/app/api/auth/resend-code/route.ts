import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api";
import { sendVerificationSms } from "@/lib/sms";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Geçersiz istek", 400);

  const { phone } = body;
  if (!phone) return apiError("Telefon numarası zorunludur", 400);

  const normalizedPhone = phone.replace(/\D/g, "");
  const user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });

  if (!user) return apiError("Kullanıcı bulunamadı", 404);
  if (user.phoneVerified) return apiError("Telefon zaten doğrulanmış", 400);

  const smsResult = await sendVerificationSms(normalizedPhone, user.id);

  return apiSuccess({
    message: smsResult.message,
    devCode: smsResult.code,
  });
}
