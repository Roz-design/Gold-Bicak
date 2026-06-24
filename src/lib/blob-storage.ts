import { put } from "@vercel/blob";

function getBlobStoreId() {
  return (
    process.env.BLOB_PUBLIC_STORE_ID?.trim() || process.env.BLOB_STORE_ID?.trim()
  );
}

/** Vercel OIDC (BLOB_STORE_ID) veya klasik token ile Blob kullanılabilir. */
export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim() || getBlobStoreId());
}

export function getBlobAuthMode() {
  if (getBlobStoreId()) return "oidc";
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
  const storeId = getBlobStoreId();

  try {
    return await put(storagePath, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      ...(storeId ? { storeId } : {}),
      ...(token ? { token } : {}),
    });
  } catch (error) {
    console.error("[blob] Yükleme hatası:", error);
    const message = error instanceof Error ? error.message : "Blob yükleme hatası";

    if (message.includes("private store") || message.includes("private access")) {
      throw new Error("BLOB_PRIVATE_STORE");
    }

    throw new Error(`BLOB_UPLOAD_FAILED:${message}`);
  }
}
