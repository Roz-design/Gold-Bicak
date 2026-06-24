import { put } from "@vercel/blob";

function getPublicStoreId() {
  return process.env.BLOB_PUBLIC_STORE_ID?.trim() || "";
}

function getDefaultStoreId() {
  return process.env.BLOB_STORE_ID?.trim() || "";
}

function getReadWriteToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

/** Vercel OIDC veya read-write token ile Blob kullanılabilir. */
export function isBlobConfigured() {
  return Boolean(getPublicStoreId() || getReadWriteToken() || getDefaultStoreId());
}

export function getBlobAuthMode() {
  if (getPublicStoreId()) return "public-store-id";
  if (getReadWriteToken()) return "token";
  if (getDefaultStoreId()) return "oidc";
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

  const publicStoreId = getPublicStoreId();
  const readWriteToken = getReadWriteToken();
  const defaultStoreId = getDefaultStoreId();

  try {
    // 1) Açıkça Public store ID verilmişse onu kullan
    if (publicStoreId) {
      return await put(storagePath, buffer, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        storeId: publicStoreId,
      });
    }

    // 2) Public store token'ı varsa storeId verme (Private BLOB_STORE_ID'yi ezmesin)
    if (readWriteToken) {
      return await put(storagePath, buffer, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        token: readWriteToken,
      });
    }

    // 3) Son çare: varsayılan OIDC store
    return await put(storagePath, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      storeId: defaultStoreId,
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
