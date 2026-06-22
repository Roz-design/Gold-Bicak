import { prisma } from "./db";
import { generateVerificationCode } from "./utils";

export async function sendVerificationSms(
  phone: string,
  userId?: string
): Promise<{ success: boolean; code?: string; message: string }> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.phoneVerification.create({
    data: { phone, code, expiresAt, userId },
  });

  if (process.env.SMS_MOCK === "true") {
    console.log(`[SMS MOCK] ${phone} doğrulama kodu: ${code}`);
    return {
      success: true,
      code: process.env.NODE_ENV === "development" ? code : undefined,
      message: "Doğrulama kodu gönderildi.",
    };
  }

  // Gerçek SMS entegrasyonu buraya eklenecek (Netgsm, Twilio vb.)
  return { success: true, message: "Doğrulama kodu gönderildi." };
}

export async function verifyPhoneCode(
  phone: string,
  code: string
): Promise<boolean> {
  const verification = await prisma.phoneVerification.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) return false;

  await prisma.phoneVerification.update({
    where: { id: verification.id },
    data: { verified: true },
  });

  if (verification.userId) {
    await prisma.user.update({
      where: { id: verification.userId },
      data: { phoneVerified: true },
    });
  }

  return true;
}

export async function sendOrderStatusSms(
  phone: string,
  orderNumber: string,
  status: string
) {
  const message = `Sipariş ${orderNumber} durumu: ${status}`;
  if (process.env.SMS_MOCK === "true") {
    console.log(`[SMS MOCK] ${phone}: ${message}`);
    return;
  }
  // Gerçek SMS API
}
