"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  saleType?: "ADET" | "PAKET" | "KOLI";
  quantity?: number;
  disabled?: boolean;
  compact?: boolean;
}

export default function AddToCartButton({
  productId,
  saleType = "ADET",
  quantity = 1,
  disabled,
  compact,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, saleType, quantity }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/giris?redirect=/sepet");
        return;
      }

      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || "Sepete eklenemedi");
      }
    } catch {
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleAdd}
        disabled={disabled || loading}
        className="flex items-center justify-center rounded-lg bg-gold px-3 py-2 text-brand-black hover:bg-gold-dark disabled:opacity-50 transition-colors"
        title="Sepete Ekle"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50 transition-colors"
    >
      <ShoppingCart className="h-5 w-5" />
      {loading ? "Ekleniyor..." : "Sepete Ekle"}
    </button>
  );
}
