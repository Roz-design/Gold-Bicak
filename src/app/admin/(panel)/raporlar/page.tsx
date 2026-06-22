"use client";

import { adminPath, adminApiPath } from "@/lib/admin-path";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function AdminReportsPage() {
  const [type, setType] = useState("daily");
  const [report, setReport] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(adminApiPath(`/reports?type=${type}`))
      .then((r) => r.json())
      .then((d) => d.success && setReport(d.data));
  }, [type]);

  if (!report) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Raporlar</h1>
      <div className="mt-4 flex gap-2">
        {[
          { value: "daily", label: "Günlük" },
          { value: "weekly", label: "Haftalık" },
          { value: "monthly", label: "Aylık" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-lg px-4 py-2 text-sm ${type === t.value ? "bg-gold text-brand-black" : "bg-white border"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Toplam Satış</div>
          <div className="text-2xl font-bold text-gold">{formatPrice(report.totalSales as number)}</div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Sipariş Sayısı</div>
          <div className="text-2xl font-bold">{report.orderCount as number}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">En Çok Satan Ürünler</h2>
          <div className="mt-4 space-y-2">
            {(report.topProducts as Array<{ name: string; quantity: number; revenue: number }>)?.map((p, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{p.name} ({p.quantity} adet)</span>
                <span className="font-medium">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">En Çok Sipariş Veren Müşteriler</h2>
          <div className="mt-4 space-y-2">
            {(report.topCustomers as Array<{ name: string; count: number; total: number }>)?.map((c, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{c.name} ({c.count} sipariş)</span>
                <span className="font-medium">{formatPrice(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Düşük Stok Raporu</h2>
        <div className="mt-4 space-y-2">
          {(report.lowStock as Array<{ name: string; code: string; stock: number }>)?.map((p) => (
            <div key={p.code} className="flex justify-between text-sm">
              <span>{p.name} ({p.code})</span>
              <span className={p.stock <= 5 ? "text-red-600 font-bold" : "text-yellow-600"}>
                {p.stock} adet
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
