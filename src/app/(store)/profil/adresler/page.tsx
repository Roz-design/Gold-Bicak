"use client";

import { useEffect, useState } from "react";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Array<Record<string, string | boolean>>>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    isDefault: false,
  });

  function loadAddresses() {
    fetch("/api/profile/addresses")
      .then((r) => r.json())
      .then((d) => d.success && setAddresses(d.data));
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/profile/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    loadAddresses();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Kayıtlı Adresler</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-gold px-4 py-2 text-sm text-brand-black hover:bg-gold-dark"
        >
          Yeni Adres Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl border p-4 space-y-3">
          {[
            ["title", "Adres Başlığı"],
            ["fullName", "Ad Soyad"],
            ["phone", "Telefon"],
            ["address", "Adres"],
            ["city", "İl"],
            ["district", "İlçe"],
            ["postalCode", "Posta Kodu"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium">{label}</label>
              <input
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          ))}
          <button type="submit" className="rounded-lg bg-gold px-4 py-2 text-sm text-brand-black">
            Kaydet
          </button>
        </form>
      )}

      <div className="mt-4 space-y-3">
        {addresses.map((addr) => (
          <div key={addr.id as string} className="rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{addr.title as string}</span>
              {addr.isDefault && (
                <span className="rounded bg-gold-light px-2 py-0.5 text-xs text-gold-dark">Varsayılan</span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {addr.fullName as string} — {addr.phone as string}
            </p>
            <p className="text-sm text-slate-600">
              {addr.address as string}, {addr.district as string}/{addr.city as string} {addr.postalCode as string}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
