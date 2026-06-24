const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  heic: "image/heic",
  heif: "image/heif",
  bmp: "image/bmp",
};

const ALLOWED_MIME_TYPES = new Set(Object.values(EXTENSION_TO_MIME));

export function resolveUploadedImageType(file: File) {
  const normalizedType = file.type.trim().toLowerCase();

  if (normalizedType && ALLOWED_MIME_TYPES.has(normalizedType)) {
    return normalizedType;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const fromExtension = EXTENSION_TO_MIME[extension];

  if (fromExtension) {
    return fromExtension;
  }

  return null;
}

export function resolveUploadedImageExtension(file: File, mimeType: string) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && EXTENSION_TO_MIME[fromName]) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    case "image/bmp":
      return "bmp";
    default:
      return "jpg";
  }
}

export function isHeicLike(mimeType: string) {
  return mimeType === "image/heic" || mimeType === "image/heif";
}
