"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState({
    bankName: "Ziraat Bankası",
    accountHolder: "Gold Bıçakçılık Ltd. Şti.",
    iban: "TR00 0000 0000 0000 0000 0000 00",
  });

  const [form, setForm] = useState({
    customerName: "",
    tcKimlik: "",
    phone: "",
    email: "",
    shippingAddress: "",
    city: "",
    district: "",
    postalCode: "",
    orderNote: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    description: "",
    transferDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.settings.bankInfo) {
          setBankInfo(d.data.settings.bankInfo);
        }
      });
  }, []);

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      setOrderId(data.data.id);
    } else {
      setError(data.error || "Sipariş oluşturulamadı");
    }
    setLoading(false);
  }

  async function handlePaymentNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);

    const res = await fetch(`/api/orders/${orderId}/payment-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentForm),
    });

    const data = await res.json();
    if (data.success) {
      router.push("/profil/siparisler");
    } else {
      setError(data.error || "Ödeme bildirimi yapılamadı");
    }
    setLoading(false);
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold">Havale / EFT ile Ödeme</h1>
        <div className="mt-6 rounded-xl border bg-slate-50 p-6">
          <h2 className="font-semibold">Banka Bilgileri</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Banka:</dt><dd className="font-medium">{bankInfo.bankName}</dd></div>
            <div className="flex justify-between"><dt>Hesap Sahibi:</dt><dd className="font-medium">{bankInfo.accountHolder}</dd></div>
            <div className="flex justify-between"><dt>IBAN:</dt><dd className="font-mono font-medium">{bankInfo.iban}</dd></div>
          </dl>
        </div>
        <form onSubmit={handlePaymentNotify} className="mt-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium">Havale Tarihi</label>
            <input
              type="date"
              value={paymentForm.transferDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, transferDate: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Açıklama</label>
            <textarea
              value={paymentForm.description}
              onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border px-4 py-2"
              placeholder="Dekont açıklaması veya notunuz"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-500 disabled:opacity-50"
          >
            {loading ? "Gönderiliyor..." : "Ödeme Bildirimi Yap"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Sipariş Bilgileri</h1>
      <p className="mt-2 text-sm text-slate-500">Tüm alanlar zorunludur</p>
      <form onSubmit={handleOrder} className="mt-6 space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        {Object.entries({
          customerName: "Ad Soyad",
          tcKimlik: "T.C. Kimlik No",
          phone: "Telefon",
          email: "E-posta",
          shippingAddress: "Teslimat Adresi",
          city: "İl",
          district: "İlçe",
          postalCode: "Posta Kodu",
        }).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium">{label}</label>
            <input
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium">Sipariş Notu (Opsiyonel)</label>
          <textarea
            value={form.orderNote}
            onChange={(e) => setForm({ ...form, orderNote: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border px-4 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold py-3 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
        >
          {loading ? "Oluşturuluyor..." : "Siparişi Oluştur"}
        </button>
      </form>
    </div>
  );
}
