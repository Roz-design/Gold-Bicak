import { put } from "@vercel/blob";

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function uploadImageToBlob(
  storagePath: string,
  buffer: Buffer,
  contentType: string
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (!token) {
    throw new Error("BLOB_NOT_CONFIGURED");
  }

  try {
    return await put(storagePath, buffer, {
      access: "public",
      token,
      contentType,
      addRandomSuffix: false,
    });
  } catch (error) {
    console.error("[blob] Yükleme hatası:", error);
    const message = error instanceof Error ? error.message : "Blob yükleme hatası";
    throw new Error(`BLOB_UPLOAD_FAILED:${message}`);
  }
}
