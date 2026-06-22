"use client";

import { useState } from "react";
import { getOrderStatusColor, formatPrice } from "@/lib/utils";
import OrderTrackTimeline from "@/components/order/OrderTrackTimeline";
import { Package, Search, ExternalLink } from "lucide-react";

type TrackResult = {
  orderNumber: string;
  status: string;
  statusLabel: string;
  totalAmount: number;
  createdAt: string;
  trackingNumber: string | null;
  carrierName: string | null;
  trackingUrl: string | null;
  shipping: { city: string; district: string };
  paymentReported: boolean;
  items: { productName: string; saleType: string; quantity: number; totalPrice: number }[];
  timeline: { status: string; statusLabel: string; note: string | null; createdAt: string }[];
};

export default function OrderTrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    const payload: Record<string, string> = {
      orderNumber: orderNumber.trim(),
    };

    if (contact.includes("@")) {
      payload.email = contact.trim();
    } else {
      payload.phone = contact.trim();
    }

    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      setOrder(data.data);
    } else {
      setError(data.error || "Sipariş bulunamadı");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <Package className="mx-auto h-12 w-12 text-gold" />
        <h1 className="mt-4 text-2xl font-bold text-brand-black">Sipariş Takip</h1>
        <p className="mt-2 text-neutral-500">
          Sipariş numaranız ve kayıtlı telefon veya e-posta ile sorgulayın
        </p>
      </div>

      <form onSubmit={handleTrack} className="mt-8 space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-brand-black">Sipariş Numarası</label>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            required
            placeholder="BS202601221234"
            className="mt-1 w-full rounded-lg border border-neutral-200 px-4 py-2 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-black">
            Telefon veya E-posta
          </label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            placeholder="05XX XXX XX XX veya ornek@email.com"
            className="mt-1 w-full rounded-lg border border-neutral-200 px-4 py-2 focus:border-gold focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Sipariş verirken kullandığınız iletişim bilgisini girin
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {loading ? "Sorgulanıyor..." : "Siparişi Sorgula"}
        </button>
      </form>

      {order && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm text-neutral-500">Sipariş No</div>
              <div className="text-lg font-bold text-brand-black">{order.orderNumber}</div>
              <div className="mt-1 text-xs text-neutral-500">
                {new Date(order.createdAt).toLocaleString("tr-TR")} · {order.shipping.district}/{order.shipping.city}
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusColor(order.status)}`}>
              {order.statusLabel}
            </span>
          </div>

          {(order.trackingNumber || order.carrierName) && (
            <div className="mt-4 rounded-lg border border-gold/30 bg-gold-light p-4 text-sm">
              {order.carrierName && (
                <div>
                  Kargo Firması: <strong>{order.carrierName}</strong>
                </div>
              )}
              {order.trackingNumber && (
                <div className="mt-1">
                  Takip No: <strong>{order.trackingNumber}</strong>
                </div>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-gold-dark hover:underline"
                >
                  Kargo takibini aç
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {order.paymentReported && (
            <p className="mt-3 text-sm text-emerald-700">Ödeme bildiriminiz alınmıştır.</p>
          )}

          <OrderTrackTimeline currentStatus={order.status} timeline={order.timeline} />

          <div className="mt-6 border-t pt-4">
            <h3 className="mb-2 font-semibold text-brand-black">Sipariş Özeti</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <span>{item.productName} x{item.quantity}</span>
                <span>{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t pt-2 font-bold">
              <span>Toplam</span>
              <span className="text-gold">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
