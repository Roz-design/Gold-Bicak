"use client";

import { useEffect, useState } from "react";
import { getOrderStatusLabel, getOrderStatusColor, formatPrice, getSaleTypeLabel } from "@/lib/utils";
import { adminApiPath } from "@/lib/admin-path";

const ORDER_STATUSES = [
  "SIPARIS_ALINDI",
  "ODEME_BEKLENIYOR",
  "ODEME_BILDIRILDI",
  "ODEME_ONAYLANDI",
  "HAZIRLANIYOR",
  "KARGOYA_VERILDI",
  "TESLIM_EDILDI",
  "IPTAL_EDILDI",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  function loadOrders() {
    fetch(adminApiPath("/orders"))
      .then((r) => r.json())
      .then((d) => d.success && setOrders(d.data));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId: string, status: string) {
    await fetch(adminApiPath("/orders"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    loadOrders();
    if (selected?.id === orderId) {
      setSelected({ ...selected, status });
    }
  }

  async function updateShipping(orderId: string) {
    await fetch(adminApiPath("/orders"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, trackingNumber, carrierName, trackingUrl }),
    });
    loadOrders();
    if (selected?.id === orderId) {
      setSelected({
        ...selected,
        trackingNumber,
        carrierName,
        trackingUrl,
      });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Sipariş Yönetimi</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Durum güncellemeleri müşteri takip sayfasına ve SMS bildirimlerine yansır.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {orders.map((order) => (
            <button
              key={order.id as string}
              onClick={() => {
                setSelected(order);
                setTrackingNumber((order.trackingNumber as string) || "");
                setCarrierName((order.carrierName as string) || "");
                setTrackingUrl((order.trackingUrl as string) || "");
              }}
              className={`w-full rounded-xl border p-4 text-left hover:border-gold ${selected?.id === order.id ? "border-gold bg-gold-light" : "bg-white"}`}
            >
              <div className="flex justify-between">
                <span className="font-bold">{order.orderNumber as string}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${getOrderStatusColor(order.status as string)}`}>
                  {getOrderStatusLabel(order.status as string)}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {order.customerName as string} — {formatPrice(order.totalAmount as number)}
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-bold">Sipariş Detayı</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="text-slate-500">Sipariş No</dt><dd className="font-medium">{selected.orderNumber as string}</dd></div>
              <div><dt className="text-slate-500">Müşteri</dt><dd>{selected.customerName as string}</dd></div>
              <div><dt className="text-slate-500">T.C.</dt><dd>{selected.tcKimlik as string}</dd></div>
              <div><dt className="text-slate-500">Telefon</dt><dd>{selected.phone as string}</dd></div>
              <div><dt className="text-slate-500">E-posta</dt><dd>{selected.email as string}</dd></div>
              <div><dt className="text-slate-500">Adres</dt><dd>{selected.shippingAddress as string}, {selected.district as string}/{selected.city as string}</dd></div>
              {selected.orderNote ? (
                <div><dt className="text-slate-500">Not</dt><dd>{selected.orderNote as string}</dd></div>
              ) : null}
            </dl>

            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium">Ürünler</h3>
              {(selected.items as Array<Record<string, unknown>>)?.map((item, i) => (
                <div key={i} className="flex justify-between py-1 text-sm">
                  <span>{item.productName as string} ({getSaleTypeLabel(item.saleType as string)}) x{item.quantity as number}</span>
                  <span>{formatPrice(item.totalPrice as number)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium">Durum Değiştir</label>
              <select
                value={selected.status as string}
                onChange={(e) => updateStatus(selected.id as string, e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-medium">Kargo Bilgileri</h3>
              <input
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                placeholder="Kargo firması (Yurtiçi, Aras...)"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Kargo takip numarası"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="Takip linki (https://...)"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <button
                onClick={() => updateShipping(selected.id as string)}
                className="rounded-lg bg-gold px-4 py-2 text-sm text-brand-black"
              >
                Kargo Bilgilerini Kaydet
              </button>
            </div>

            {(selected.paymentNotification as Record<string, unknown>) && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm">
                <strong>Ödeme Bildirimi:</strong>{" "}
                {(selected.paymentNotification as Record<string, unknown>).description as string || "Bildirim yapıldı"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
