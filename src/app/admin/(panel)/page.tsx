"use client";

import { adminPath, adminApiPath } from "@/lib/admin-path";
import { useEffect, useState } from "react";
import { formatPrice, getOrderStatusLabel } from "@/lib/utils";
import { Package, ShoppingCart, Users, TrendingUp, Truck, Clock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<{
    stats: {
      totalProducts: number;
      totalOrders: number;
      pendingOrders: number;
      shippedOrders: number;
      totalUsers: number;
      dailySales: number;
      monthlySales: number;
    };
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      totalAmount: number;
      status: string;
      createdAt: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(adminApiPath("/dashboard"), { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d.data);
          setError("");
        } else {
          setError(d.error || "Veriler yüklenemedi");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Sunucuya bağlanılamadı");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-gold" />
        <span className="text-slate-500">Dashboard yükleniyor...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <p className="mt-3 font-medium text-red-800">{error || "Veri bulunamadı"}</p>
        <Link
          href={adminPath("/giris")}
          className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 text-sm text-brand-black hover:bg-gold-dark"
        >
          Giriş Sayfasına Dön
        </Link>
      </div>
    );
  }

  const cards = [
    { label: "Toplam Ürün", value: data.stats.totalProducts, icon: Package, color: "bg-blue-500" },
    { label: "Toplam Sipariş", value: data.stats.totalOrders, icon: ShoppingCart, color: "bg-green-500" },
    { label: "Bekleyen Sipariş", value: data.stats.pendingOrders, icon: Clock, color: "bg-yellow-500" },
    { label: "Kargodaki Sipariş", value: data.stats.shippedOrders, icon: Truck, color: "bg-purple-500" },
    { label: "Toplam Üye", value: data.stats.totalUsers, icon: Users, color: "bg-indigo-500" },
    { label: "Günlük Satış", value: formatPrice(data.stats.dailySales), icon: TrendingUp, color: "bg-gold-dark" },
    { label: "Aylık Satış", value: formatPrice(data.stats.monthlySales), icon: TrendingUp, color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${card.color} p-2 text-white`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-500">{card.label}</div>
                <div className="text-xl font-bold">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Son Siparişler</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-2">Sipariş No</th>
                <th className="pb-2">Müşteri</th>
                <th className="pb-2">Tutar</th>
                <th className="pb-2">Durum</th>
                <th className="pb-2">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Henüz sipariş yok
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2 font-medium">{order.orderNumber}</td>
                    <td className="py-2">{order.customerName}</td>
                    <td className="py-2">{formatPrice(order.totalAmount)}</td>
                    <td className="py-2">{getOrderStatusLabel(order.status)}</td>
                    <td className="py-2">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
