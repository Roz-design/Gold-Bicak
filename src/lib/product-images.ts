export const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  "sef-bicagi-20cm": "/products/sef-bicagi-20cm.jpg",
  "kasap-satiri-30cm": "/products/kasap-satiri-30cm.jpg",
  "av-bicagi-15cm": "/products/av-bicagi-15cm.jpg",
  "kamp-bicagi-cok-amacli": "/products/kamp-bicagi-cok-amacli.jpg",
  "klasik-caki-85mm": "/products/klasik-caki-85mm.jpg",
  "bileme-tasi-seti": "/products/bileme-tasi-seti.jpg",
  "santoku-bicagi-18cm": "/products/santoku-bicagi-18cm.jpg",
  "ekmek-bicagi-20cm": "/products/ekmek-bicagi-20cm.jpg",
  "outdoor-survival-bicagi": "/products/outdoor-survival-bicagi.jpg",
};

export function getProductImage(
  slug: string,
  imageUrl: string | null | undefined
): string {
  if (
    imageUrl &&
    (imageUrl.startsWith("/") ||
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://"))
  ) {
    return imageUrl;
  }
  return DEFAULT_PRODUCT_IMAGES[slug] || "/products/sef-bicagi-20cm.jpg";
}
