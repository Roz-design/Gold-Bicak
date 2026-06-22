"use client";

import { adminApiPath } from "@/lib/admin-path";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { Loader2, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
  active: boolean;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [imageDrafts, setImageDrafts] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    fetch(adminApiPath("/categories"))
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch(adminApiPath("/categories"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  }

  async function updateCategory(id: string, data: Record<string, unknown>) {
    setSavingId(id);
    const res = await fetch(adminApiPath(`/categories/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSavingId(null);
    if (result.success) load();
    else alert(result.error || "Güncelleme başarısız");
  }

  async function handleDelete(id: string) {
    if (!confirm("Kategoriyi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(adminApiPath(`/categories/${id}`), { method: "DELETE" });
    const data = await res.json();
    if (!data.success) alert(data.error);
    else load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Kategori Yönetimi</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Ana sayfadaki kategori kapak fotoğraflarını buradan düzenleyin.
      </p>

      <form onSubmit={handleAdd} className="mt-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yeni kategori adı"
          required
          className="rounded-lg border px-4 py-2"
        />
        <button type="submit" className="rounded-lg bg-gold px-4 py-2 text-brand-black">
          Ekle
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Yükleniyor...
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-neutral-100">
                {cat.image ? (
                  <FlexibleImage
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-400">
                    Kapak fotoğrafı yok
                  </div>
                )}
                {!cat.active && (
                  <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs text-white">
                    Pasif
                  </span>
                )}
              </div>

              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{cat.name}</h2>
                    <p className="text-xs text-neutral-500">
                      {cat._count.products} ürün · /kategori/{cat.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <ImageUpload
                  label="Kapak Fotoğrafı"
                  folder="categories"
                  value={imageDrafts[cat.id] ?? cat.image ?? ""}
                  previewClassName="h-24 w-full"
                  onChange={(url) => {
                    setImageDrafts((prev) => ({ ...prev, [cat.id]: url }));
                    if (url.startsWith("/uploads/") || url.startsWith("http")) {
                      updateCategory(cat.id, { image: url });
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={savingId === cat.id}
                  onClick={() =>
                    updateCategory(cat.id, {
                      image: imageDrafts[cat.id] ?? cat.image ?? "",
                    })
                  }
                  className="w-full rounded-lg border border-gold px-3 py-2 text-sm font-medium text-brand-black hover:bg-gold-light disabled:opacity-50"
                >
                  Kapak Fotoğrafını Kaydet
                </button>

                {savingId === cat.id && (
                  <p className="text-xs text-gold-dark">Kaydediliyor...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
