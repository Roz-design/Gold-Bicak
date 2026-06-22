import { adminPath } from "@/lib/admin-path";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href={adminPath("/urunler")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-gold"
      >
        <ChevronLeft className="h-4 w-4" /> Ürünlere Dön
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Yeni Ürün Ekle</h1>
      <p className="mt-1 text-sm text-slate-500">Tüm fiyat birimlerini ve görselleri ekleyin</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
