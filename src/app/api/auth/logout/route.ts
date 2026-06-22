import { clearAuthCookie } from "@/lib/auth";
import { apiSuccess } from "@/lib/api";

export async function POST() {
  await clearAuthCookie();
  return apiSuccess({ message: "Çıkış yapıldı" });
}
