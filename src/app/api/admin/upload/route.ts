import { put } from "@vercel/blob";
import { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { handleAdminError } from "@/lib/admin-api";
import {
  isHeicLike,
  resolveUploadedImageExtension,
  resolveUploadedImageType,
} from "@/lib/upload-image";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError("Dosya seçilmedi", 400);
    }

    const folderRaw = formData.get("folder");
    const folder =
      typeof folderRaw === "string" && /^[a-z0-9-]+$/.test(folderRaw)
        ? folderRaw
        : "general";

    const mimeType = resolveUploadedImageType(file);
    if (!mimeType) {
      return apiError(
        "Desteklenmeyen dosya türü. JPG, PNG, WebP, GIF veya SVG yükleyin.",
        400
      );
    }

    if (isHeicLike(mimeType)) {
      return apiError(
        "iPhone HEIC formatı desteklenmiyor. Fotoğrafı JPG/PNG olarak kaydedip tekrar deneyin.",
        400
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return apiError("Dosya boyutu 5MB'dan küçük olmalıdır", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = resolveUploadedImageExtension(file, mimeType);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `uploads/${folder}/${filename}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(storagePath, buffer, {
        access: "public",
        contentType: mimeType,
        addRandomSuffix: false,
      });

      return apiSuccess({ url: blob.url }, 201);
    }

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      return apiSuccess({ url: `/uploads/${folder}/${filename}` }, 201);
    } catch (filesystemError) {
      console.error("[upload] Dosya sistemi hatası:", filesystemError);
      return apiError(
        "Sunucuya dosya kaydedilemedi. Vercel'de Storage → Blob Store oluşturup projeye bağlayın.",
        500
      );
    }
  } catch (error) {
    return handleAdminError(error);
  }
}
