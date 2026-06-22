"use client";

import { adminPath, adminApiPath } from "@/lib/admin-path";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { Pencil, Trash2, Eye, EyeOff, Loader2, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  code: string;
  stock: number;
  priceAdet: number;
  hidden: boolean;
  featured: boolean;
  category: { name: string };
  images: { url: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  function loadProducts() {
    setLoading(true);
    fetch(adminApiPath("/products"))
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProducts(d.data);
          setError("");
        } else {
          setError(d.error || "Ürünler yüklenemedi");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Bağlantı hatası");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function toggleHidden(product: Product) {
    setActionId(product.id);
    const res = await fetch(adminApiPath(`/products/${product.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !product.hidden }),
    });
    const data = await res.json();
    if (data.success) {
      setProducts((p) =>
        p.map((prod) => (prod.id === product.id ? { ...prod, hidden: !prod.hidden } : prod))
      );
    } else {
      alert(data.error);
    }
    setActionId(null);
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`"${product.name}" ürününü silmek istediğinize emin misiniz?`)) return;
    setActionId(product.id);
    const res = await fetch(adminApiPath(`/products/${product.id}`), { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setProducts((p) => p.filter((prod) => prod.id !== product.id));
    } else {
      alert(data.error || "Silme başarısız");
    }
    setActionId(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ürün Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">{products.length} ürün</p>
        </div>
        <Link
          href={adminPath("/urunler/yeni")}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-brand-black hover:bg-gold-dark"
        >
          <Plus className="h-4 w-4" /> Yeni Ürün
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yükleniyor...
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed bg-white py-16 text-center">
          <p className="text-slate-500">Henüz ürün eklenmemiş</p>
          <Link href={adminPath("/urunler/yeni")} className="mt-4 inline-block text-gold hover:underline">
            İlk ürünü ekleyin →
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-600">
                  <th className="p-4">Görsel</th>
                  <th className="p-4">Kod</th>
                  <th className="p-4">Ürün</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Adet Fiyat</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                        {product.images[0] ? (
                          <FlexibleImage
                            src={product.images[0].url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-400">—</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs">{product.code}</td>
                    <td className="p-4">
                      <div className="font-medium">{product.name}</div>
                      {product.featured && (
                        <span className="text-xs text-gold">Öne çıkan</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">{product.category?.name}</td>
                    <td className="p-4 font-medium">{formatPrice(product.priceAdet)}</td>
                    <td className="p-4">
                      <span className={product.stock <= 10 ? "font-bold text-red-600" : ""}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      {product.hidden ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          <EyeOff className="h-3 w-3" /> Gizli
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          <Eye className="h-3 w-3" /> Aktif
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={adminPath(`/urunler/${product.id}`)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => toggleHidden(product)}
                          disabled={actionId === product.id}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          title={product.hidden ? "Göster" : "Gizle"}
                        >
                          {product.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteProduct(product)}
                          disabled={actionId === product.id}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
