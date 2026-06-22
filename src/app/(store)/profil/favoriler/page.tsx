"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { formatPrice } from "@/lib/utils";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Array<{
    productId: string;
    product: {
      id: string;
      name: string;
      slug: string;
      priceAdet: number;
      images: { url: string }[];
    };
  }>>([]);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => d.success && setFavorites(d.data));
  }, []);

  async function removeFavorite(productId: string) {
    await fetch(`/api/favorites/${productId}`, { method: "DELETE" });
    setFavorites((f) => f.filter((x) => x.productId !== productId));
  }

  return (
    <div>
      <h2 className="text-lg font-bold">Favori Ürünler</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {favorites.length === 0 && <p className="text-slate-500">Favori ürününüz yok.</p>}
        {favorites.map((fav) => (
          <div key={fav.productId} className="flex gap-4 rounded-xl border p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <FlexibleImage
                src={fav.product.images[0]?.url || "/placeholder-product.jpg"}
                alt={fav.product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1">
              <Link href={`/urunler/${fav.product.slug}`} className="font-medium hover:text-gold">
                {fav.product.name}
              </Link>
              <p className="text-sm font-bold text-gold">{formatPrice(fav.product.priceAdet)}</p>
            </div>
            <button onClick={() => removeFavorite(fav.productId)} className="text-red-500">
              <Heart className="h-5 w-5 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
