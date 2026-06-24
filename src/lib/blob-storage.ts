import { put } from "@vercel/blob";

function findEnvValue(...candidates: string[]) {
  for (const key of candidates) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

function findEnvBySuffix(suffix: string) {
  for (const [key, value] of Object.entries(process.env)) {
    if (key.endsWith(suffix) && value?.trim()) {
      return { key, value: value.trim() };
    }
  }
  return null;
}

function getPublicStoreId() {
  const direct = findEnvValue("BLOB_PUBLIC_STORE_ID", "BLOB_STORE_ID");
  if (direct) return direct;

  const match = findEnvBySuffix("_STORE_ID");
  return match?.value ?? "";
}

function getReadWriteToken() {
  const direct = findEnvValue("BLOB_READ_WRITE_TOKEN");
  if (direct) return direct;

  const match =
    findEnvBySuffix("_READ_WRITE_TOKEN") ?? findEnvBySuffix("_BLOB_READ_WRITE_TOKEN");
  return match?.value ?? "";
}

export function getBlobEnvDebug() {
  const storeMatch = findEnvBySuffix("_STORE_ID");
  const tokenMatch =
    findEnvBySuffix("_READ_WRITE_TOKEN") ?? findEnvBySuffix("_BLOB_READ_WRITE_TOKEN");

  return {
    storeEnvKey: process.env.BLOB_PUBLIC_STORE_ID
      ? "BLOB_PUBLIC_STORE_ID"
      : process.env.BLOB_STORE_ID
        ? "BLOB_STORE_ID"
        : storeMatch?.key ?? null,
    tokenEnvKey: process.env.BLOB_READ_WRITE_TOKEN
      ? "BLOB_READ_WRITE_TOKEN"
      : tokenMatch?.key ?? null,
  };
}

/** Vercel OIDC veya read-write token ile Blob kullanılabilir. */
export function isBlobConfigured() {
  return Boolean(getPublicStoreId() || getReadWriteToken());
}

export function getBlobAuthMode() {
  if (getReadWriteToken()) return "token";
  if (getPublicStoreId()) return "oidc";
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

  try {
    if (readWriteToken) {
      return await put(storagePath, buffer, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        token: readWriteToken,
      });
    }

    return await put(storagePath, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      storeId: publicStoreId,
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
