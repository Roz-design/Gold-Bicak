import { NextRequest } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { updateSiteSetting, getSiteSettings } from "@/lib/settings";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getSiteSettings();
    return apiSuccess(settings);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    for (const [key, value] of Object.entries(body)) {
      await updateSiteSetting(key, value);
    }

    await logAdminAction(admin.id, "SETTINGS_UPDATE", "Site ayarları güncellendi", getClientIp(request));
    return apiSuccess({ message: "Ayarlar güncellendi" });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}
