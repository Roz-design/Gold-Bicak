import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { validateTcKimlik } from "@/lib/utils";
import { sendVerificationSms } from "@/lib/sms";
import { isPhoneVerificationRequired } from "@/lib/phone-verification";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Geçersiz istek", 400);

  const { firstName, lastName, tcKimlik, phone, email, password } = body;

  if (!firstName || !lastName || !tcKimlik || !phone || !email || !password) {
    return apiError("Tüm alanlar zorunludur", 400);
  }

  if (!validateTcKimlik(tcKimlik)) {
    return apiError("Geçersiz T.C. Kimlik Numarası", 400);
  }

  if (password.length < 6) {
    return apiError("Şifre en az 6 karakter olmalıdır", 400);
  }

  const normalizedPhone = phone.replace(/\D/g, "");

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { tcKimlik }, { phone: normalizedPhone }],
    },
  });

  if (existing) {
    return apiError("Bu e-posta, T.C. veya telefon zaten kayıtlı", 409);
  }

  const passwordHash = await hashPassword(password);
  const phoneVerificationRequired = isPhoneVerificationRequired();

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      tcKimlik,
      phone: normalizedPhone,
      email,
      passwordHash,
      phoneVerified: !phoneVerificationRequired,
    },
  });

  if (!phoneVerificationRequired) {
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

    return apiSuccess(
      {
        requiresVerification: false,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      201
    );
  }

  const smsResult = await sendVerificationSms(normalizedPhone, user.id);

  return apiSuccess(
    {
      requiresVerification: true,
      userId: user.id,
      message: smsResult.message,
      devCode: smsResult.code,
    },
    201
  );
}
