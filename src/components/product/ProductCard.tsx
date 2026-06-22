import Link from "next/link";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { formatPrice } from "@/lib/utils";
import { getProductImage } from "@/lib/product-images";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    code: string;
    shortDescription: string;
    priceAdet: number;
    stock: number;
    images: { url: string }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getProductImage(product.slug, product.images[0]?.url);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-gold hover:shadow-xl active:scale-[0.98] active:translate-y-0 active:shadow-md">
      <Link
        href={`/urunler/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-neutral-100"
      >
        <FlexibleImage
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-active:scale-105"
          sizes="(max-width:768px) 100vw, 300px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {product.stock <= 0 && (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
            Stokta Yok
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium text-gold">{product.code}</span>
        <Link href={`/urunler/${product.slug}`}>
          <h3 className="mt-1 font-semibold text-brand-black transition-colors hover:text-gold">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{product.shortDescription}</p>
        <div className="mt-auto pt-3">
          <p className="text-lg font-bold text-brand-black">
            {formatPrice(product.priceAdet)}
            <span className="text-sm font-normal text-neutral-500"> / adet</span>
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/urunler/${product.slug}`}
              className="flex-1 rounded-lg border border-neutral-300 py-2 text-center text-sm font-medium transition-all hover:border-gold hover:bg-gold-light active:scale-95"
            >
              İncele
            </Link>
            <AddToCartButton productId={product.id} disabled={product.stock <= 0} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
