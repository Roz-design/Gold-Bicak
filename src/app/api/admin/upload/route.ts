import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { handleAdminError } from "@/lib/admin-api";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) return apiError("Dosya seçilmedi", 400);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return apiError("Sadece JPEG, PNG, WebP, GIF veya SVG yüklenebilir", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return apiError("Dosya boyutu 5MB'dan küçük olmalıdır", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${folder}/${filename}`;
    return apiSuccess({ url }, 201);
  } catch (error) {
    return handleAdminError(error);
  }
}
