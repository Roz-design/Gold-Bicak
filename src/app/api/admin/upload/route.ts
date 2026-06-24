import { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { handleAdminError } from "@/lib/admin-api";
import { isBlobConfigured, uploadImageToBlob } from "@/lib/blob-storage";
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
        "iPhone HEIC formatı desteklenmiyor. Ayarlar → Kamera → En Uyumlu (JPEG) seçin veya JPG yükleyin.",
        400
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return apiError("Dosya boyutu 8MB'dan küçük olmalıdır", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = resolveUploadedImageExtension(file, mimeType);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `uploads/${folder}/${filename}`;

    if (process.env.VERCEL === "1" || isBlobConfigured()) {
      if (!isBlobConfigured()) {
        return apiError(
          "Blob depolama bağlı değil. Vercel → Storage → Blob → projeye Connect → Redeploy yapın.",
          503
        );
      }

      const blob = await uploadImageToBlob(storagePath, buffer, mimeType);
      return apiSuccess({ url: blob.url, storage: "blob" }, 201);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return apiSuccess({ url: `/uploads/${folder}/${filename}`, storage: "local" }, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BLOB_NOT_CONFIGURED") {
        return apiError(
          "Blob depolama bağlı değil. Vercel → Storage → Blob → projeye Connect → Redeploy yapın.",
          503
        );
      }

      if (error.message.startsWith("BLOB_UPLOAD_FAILED:")) {
        return apiError(
          `Blob'a yüklenemedi: ${error.message.replace("BLOB_UPLOAD_FAILED:", "")}. Store'un Public olduğundan emin olun.`,
          502
        );
      }
    }

    return handleAdminError(error);
  }
}
