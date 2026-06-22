"use client";

import { useState } from "react";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { formatPrice, getUnitPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    code: string;
    description: string;
    specifications: string;
    stock: number;
    priceAdet: number;
    pricePaket: number;
    paketQuantity: number;
    priceKoli: number;
    koliQuantity: number;
    category: { name: string };
    images: { url: string }[];
  };
  isLoggedIn: boolean;
}

type SaleType = "ADET" | "PAKET" | "KOLI";

export default function ProductDetailClient({ product, isLoggedIn }: ProductDetailClientProps) {
  const [saleType, setSaleType] = useState<SaleType>("ADET");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const router = useRouter();

  const unitPrice = getUnitPrice(product, saleType);
  const totalPrice = unitPrice * quantity;

  const specs = JSON.parse(product.specifications || "{}") as Record<string, string>;

  async function toggleFavorite() {
    if (!isLoggedIn) {
      router.push("/giris");
      return;
    }
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    alert("Favorilere eklendi");
  }

  const saleOptions: { type: SaleType; label: string; price: number; detail: string }[] = [
    { type: "ADET", label: "Adet Bazlı", price: product.priceAdet, detail: `1 Adet = ${formatPrice(product.priceAdet)}` },
    { type: "PAKET", label: "Paket Bazlı", price: product.pricePaket, detail: `1 Paket = ${product.paketQuantity} Adet = ${formatPrice(product.pricePaket)}` },
    { type: "KOLI", label: "Koli Bazlı", price: product.priceKoli, detail: `1 Koli = ${product.koliQuantity} Adet = ${formatPrice(product.priceKoli)}` },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
          <FlexibleImage
            src={product.images[selectedImage]?.url || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-4 flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${selectedImage === i ? "border-gold" : "border-transparent"}`}
              >
                <FlexibleImage src={img.url} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className="text-sm font-medium text-gold">{product.code}</span>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{product.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Kategori: {product.category.name}</p>
        <p className="mt-1 text-sm">
          Stok:{" "}
          <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {product.stock > 0 ? `${product.stock} adet` : "Tükendi"}
          </span>
        </p>

        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-slate-900">Satış Seçenekleri</h3>
          {saleOptions.map((opt) => (
            <label
              key={opt.type}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${saleType === opt.type ? "border-gold bg-gold-light" : "border-slate-200 hover:border-slate-300"}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="saleType"
                  checked={saleType === opt.type}
                  onChange={() => setSaleType(opt.type)}
                  className="text-gold"
                />
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-slate-500">{opt.detail}</div>
                </div>
              </div>
              <div className="font-bold">{formatPrice(opt.price)}</div>
            </label>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Miktar</label>
            <div className="mt-1 flex items-center rounded-lg border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-slate-100"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-500">Toplam Tutar</div>
            <div className="text-2xl font-bold text-gold">{formatPrice(totalPrice)}</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <AddToCartButton
            productId={product.id}
            saleType={saleType}
            quantity={quantity}
            disabled={product.stock <= 0}
          />
          <button
            onClick={toggleFavorite}
            className="flex items-center justify-center rounded-lg border border-slate-300 px-4 hover:bg-slate-50"
            title="Favorilere Ekle"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 font-semibold">Ürün Açıklaması</h3>
          <p className="text-slate-600 leading-relaxed">{product.description}</p>
        </div>

        {Object.keys(specs).length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">Teknik Özellikler</h3>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(specs).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="py-2 font-medium text-slate-700">{key}</td>
                    <td className="py-2 text-slate-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
