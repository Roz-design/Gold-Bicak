const MAX_DATA_URL_BYTES = 900_000;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Görsel okunamadı"));
    };

    image.src = url;
  });
}

export async function compressImageFileToDataUrl(file: File): Promise<string> {
  const image = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Görsel işlenemedi");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (dataUrl.length > MAX_DATA_URL_BYTES && quality > 0.45) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length > MAX_DATA_URL_BYTES) {
    throw new Error("Görsel çok büyük. Daha küçük bir fotoğraf seçin.");
  }

  return dataUrl;
}

export function shouldUseDataUrlFallback(status: number, errorMessage?: string) {
  if (status === 500 && errorMessage?.includes("Blob")) return true;
  if (status === 500 && errorMessage?.includes("kaydedilemedi")) return true;
  return false;
}
