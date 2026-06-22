import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Oturum bulunamadı", 401);
  return apiSuccess({ user });
}
