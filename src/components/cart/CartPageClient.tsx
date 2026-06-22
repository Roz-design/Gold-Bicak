"use client";

import { useEffect, useState } from "react";
import FlexibleImage from "@/components/ui/FlexibleImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, getSaleTypeLabel } from "@/lib/utils";
import { Trash2, ShoppingBag } from "lucide-react";

interface CartItem {
  id: string;
  saleType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string }[];
  };
}

export default function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadCart() {
    const res = await fetch("/api/cart");
    if (res.status === 401) {
      router.push("/giris?redirect=/sepet");
      return;
    }
    const data = await res.json();
    if (data.success) {
      setItems(data.data.items);
      setTotal(data.data.total);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQuantity(id: string, quantity: number) {
    await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    loadCart();
  }

  async function removeItem(id: string) {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    loadCart();
  }

  async function clearCart() {
    if (!confirm("Sepeti temizlemek istediğinize emin misiniz?")) return;
    await fetch("/api/cart", { method: "DELETE" });
    loadCart();
  }

  if (loading) {
    return <div className="py-16 text-center text-slate-500">Yükleniyor...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
        <h2 className="mt-4 text-xl font-semibold">Sepetiniz boş</h2>
        <Link href="/urunler" className="mt-4 inline-block text-gold hover:underline">
          Alışverişe başlayın
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-xl border p-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <FlexibleImage
                src={item.product.images[0]?.url || "/placeholder-product.jpg"}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="flex-1">
              <Link href={`/urunler/${item.product.slug}`} className="font-semibold hover:text-gold">
                {item.product.name}
              </Link>
              <p className="text-sm text-slate-500">Satış tipi: {getSaleTypeLabel(item.saleType)}</p>
              <p className="text-sm">Birim: {formatPrice(item.unitPrice)}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded border">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-1">-</button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="font-bold">{formatPrice(item.totalPrice)}</div>
          </div>
        ))}
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">
          Sepeti Temizle
        </button>
      </div>

      <div className="rounded-xl border bg-slate-50 p-6 h-fit">
        <h2 className="text-lg font-bold">Sipariş Özeti</h2>
        <div className="mt-4 flex justify-between text-lg font-bold">
          <span>Toplam</span>
          <span className="text-gold">{formatPrice(total)}</span>
        </div>
        <Link
          href="/odeme"
          className="mt-6 block w-full rounded-lg bg-gold py-3 text-center font-medium text-brand-black hover:bg-gold-dark transition-colors"
        >
          Siparişi Tamamla
        </Link>
      </div>
    </div>
  );
}
