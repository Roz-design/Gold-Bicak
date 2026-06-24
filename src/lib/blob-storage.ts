import { put } from "@vercel/blob";

/** Vercel OIDC (BLOB_STORE_ID) veya klasik token ile Blob kullanılabilir. */
export function isBlobConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_STORE_ID?.trim()
  );
}

export function getBlobAuthMode() {
  if (process.env.BLOB_STORE_ID?.trim()) return "oidc";
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return "token";
  return "none";
}

export async function uploadImageToBlob(
  storagePath: string,
  buffer: Buffer,
  contentType: string
) {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_NOT_CONFIGURED");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  try {
    return await put(storagePath, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      ...(token ? { token } : {}),
    });
  } catch (error) {
    console.error("[blob] Yükleme hatası:", error);
    const message = error instanceof Error ? error.message : "Blob yükleme hatası";
    throw new Error(`BLOB_UPLOAD_FAILED:${message}`);
  }
}
