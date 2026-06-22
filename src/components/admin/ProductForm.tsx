"use client";

import { adminPath, adminApiPath } from "@/lib/admin-path";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "./ImageUpload";
import { Loader2, Plus, Trash2 } from "lucide-react";

export interface ProductFormData {
  name: string;
  code: string;
  shortDescription: string;
  description: string;
  specifications: string;
  stock: number;
  priceAdet: number;
  pricePaket: number;
  paketQuantity: number;
  priceKoli: number;
  koliQuantity: number;
  categoryId: string;
  featured: boolean;
  hidden: boolean;
  images: string[];
}

const emptyForm: ProductFormData = {
  name: "",
  code: "",
  shortDescription: "",
  description: "",
  specifications: "{}",
  stock: 0,
  priceAdet: 0,
  pricePaket: 0,
  paketQuantity: 12,
  priceKoli: 0,
  koliQuantity: 250,
  categoryId: "",
  featured: false,
  hidden: false,
  images: [""],
};

interface ProductFormProps {
  productId?: string;
  initialData?: ProductFormData;
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState<ProductFormData>(initialData || emptyForm);
  const [specRows, setSpecRows] = useState<Array<{ key: string; value: string }>>([]);
  const [loading, setLoading] = useState(isEdit && !initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(adminApiPath("/categories"))
      .then((r) => r.json())
      .then((d) => d.success && setCategories(d.data));
  }, []);

  useEffect(() => {
    if (productId && !initialData) {
      fetch(adminApiPath(`/products/${productId}`))
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            const p = d.data;
            setForm({
              name: p.name,
              code: p.code,
              shortDescription: p.shortDescription,
              description: p.description,
              specifications: p.specifications,
              stock: p.stock,
              priceAdet: p.priceAdet,
              pricePaket: p.pricePaket,
              paketQuantity: p.paketQuantity,
              priceKoli: p.priceKoli,
              koliQuantity: p.koliQuantity,
              categoryId: p.categoryId,
              featured: p.featured,
              hidden: p.hidden,
              images: p.images?.length ? p.images.map((i: { url: string }) => i.url) : [""],
            });
            try {
              const specs = JSON.parse(p.specifications || "{}");
              setSpecRows(
                Object.entries(specs).map(([key, value]) => ({
                  key,
                  value: String(value),
                }))
              );
            } catch {
              setSpecRows([]);
            }
          } else {
            setError(d.error || "Ürün yüklenemedi");
          }
          setLoading(false);
        });
    } else if (initialData) {
      try {
        const specs = JSON.parse(initialData.specifications || "{}");
        setSpecRows(
          Object.entries(specs).map(([key, value]) => ({
            key,
            value: String(value),
          }))
        );
      } catch {
        setSpecRows([]);
      }
    }
  }, [productId, initialData]);

  function buildSpecifications() {
    const obj: Record<string, string> = {};
    specRows.forEach((row) => {
      if (row.key.trim()) obj[row.key.trim()] = row.value.trim();
    });
    return JSON.stringify(obj);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      specifications: buildSpecifications(),
      images: form.images.filter((url) => url.trim()),
    };

    const url = isEdit ? adminApiPath(`/products/${productId}`) : adminApiPath("/products");
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      setSuccess(isEdit ? "Ürün güncellendi" : "Ürün eklendi");
      setTimeout(() => router.push(adminPath("/urunler")), 800);
    } else {
      setError(data.error || "Kayıt başarısız");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Yükleniyor...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Temel Bilgiler</h2>

          <div>
            <label className="block text-sm font-medium">Ürün Adı *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-gold-dark focus:outline-none focus:ring-1 focus:ring-gold-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Ürün Kodu *</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              className="mt-1 w-full rounded-lg border px-3 py-2 font-mono focus:border-gold-dark focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Kategori *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-gold-dark focus:outline-none"
            >
              <option value="">Seçiniz</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Kısa Açıklama</label>
            <input
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Detaylı Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded text-gold"
              />
              Öne çıkan ürün
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={(e) => setForm({ ...form, hidden: e.target.checked })}
                className="rounded text-gold"
              />
              Gizle (sitede gösterme)
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Fiyat ve Stok</h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["priceAdet", "Adet Fiyat (₺)"],
              ["pricePaket", "Paket Fiyat (₺)"],
              ["priceKoli", "Koli Fiyat (₺)"],
              ["stock", "Stok Adedi"],
              ["paketQuantity", "Paket = ? Adet"],
              ["koliQuantity", "Koli = ? Adet"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600">{label}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[key as keyof ProductFormData] as number}
                  onChange={(e) =>
                    setForm({ ...form, [key]: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Görseller</h2>
          <button
            type="button"
            onClick={() => setForm({ ...form, images: [...form.images, ""] })}
            className="flex items-center gap-1 text-sm text-gold hover:underline"
          >
            <Plus className="h-4 w-4" /> Görsel Ekle
          </button>
        </div>
        <div className="space-y-4">
          {form.images.map((img, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageUpload
                  value={img}
                  onChange={(url) => {
                    const images = [...form.images];
                    images[index] = url;
                    setForm({ ...form, images });
                  }}
                  label={`Görsel ${index + 1}`}
                />
              </div>
              {form.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, images: form.images.filter((_, i) => i !== index) })
                  }
                  className="mt-8 rounded p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Teknik Özellikler</h2>
          <button
            type="button"
            onClick={() => setSpecRows([...specRows, { key: "", value: "" }])}
            className="flex items-center gap-1 text-sm text-gold hover:underline"
          >
            <Plus className="h-4 w-4" /> Özellik Ekle
          </button>
        </div>
        <div className="space-y-2">
          {specRows.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={row.key}
                onChange={(e) => {
                  const rows = [...specRows];
                  rows[index].key = e.target.value;
                  setSpecRows(rows);
                }}
                placeholder="Özellik adı"
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
              />
              <input
                value={row.value}
                onChange={(e) => {
                  const rows = [...specRows];
                  rows[index].value = e.target.value;
                  setSpecRows(rows);
                }}
                placeholder="Değer"
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setSpecRows(specRows.filter((_, i) => i !== index))}
                className="rounded p-2 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Güncelle" : "Ürünü Kaydet"}
        </button>
        <Link
          href={adminPath("/urunler")}
          className="rounded-lg border px-6 py-2.5 text-sm hover:bg-slate-50"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
