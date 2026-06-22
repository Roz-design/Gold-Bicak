import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api";

export function handleAdminError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return apiError("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.", 401);
    if (error.message === "FORBIDDEN") return apiError("Bu işlem için yetkiniz yok.", 403);
    if (error.message === "PHONE_NOT_VERIFIED") return apiError("Telefon doğrulaması gerekli.", 403);
  }
  return apiError("Bir hata oluştu", 500);
}

export function handlePrismaError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    return apiError("Bu kod veya slug zaten kullanılıyor.", 409);
  }
  return handleAdminError(error);
}
