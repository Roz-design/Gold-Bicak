export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "profesyonel-bicaklar": "/categories/profesyonel-bicaklar.jpg",
  "kasap-bicaklari": "/categories/kasap-bicaklari.jpg",
  "av-bicaklari": "/categories/av-bicaklari.jpg",
  "kamp-bicaklari": "/categories/kamp-bicaklari.jpg",
  "caki-modelleri": "/categories/caki-modelleri.jpg",
  aksesuarlar: "/categories/aksesuarlar.jpg",
};

export function getCategoryImage(slug: string, image: string | null | undefined): string {
  if (
    image &&
    (image.startsWith("/") || image.startsWith("http://") || image.startsWith("https://"))
  ) {
    return image;
  }
  return DEFAULT_CATEGORY_IMAGES[slug] || "/categories/profesyonel-bicaklar.jpg";
}
