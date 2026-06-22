"use client";

import { adminPath, adminApiPath } from "@/lib/admin-path";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { Loader2, CheckCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(adminApiPath("/settings"))
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const res = await fetch(adminApiPath("/settings"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    const data = await res.json();

    if (data.success) {
      setMessage("Ayarlar başarıyla kaydedildi");
    } else {
      setError(data.error || "Kayıt başarısız");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yükleniyor...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Site Ayarları</h1>
      <p className="mt-1 text-sm text-slate-500">Logo, iletişim ve banka bilgilerini yönetin</p>

      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" /> {message}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Logo ve Firma</h2>
          <ImageUpload
            value={(settings.logo as string) || "/logo.svg"}
            onChange={(url) => setSettings({ ...settings, logo: url })}
            folder="logo"
            label="Site Logosu"
            previewClassName="h-24 w-24"
          />
          <div className="mt-4">
            <label className="block text-sm font-medium">Firma Adı</label>
            <input
              value={(settings.companyName as string) || ""}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">İletişim Bilgileri</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["phone", "Telefon"],
              ["whatsapp", "WhatsApp"],
              ["email", "E-posta"],
              ["workingHours", "Çalışma Saatleri"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium">{label}</label>
                <input
                  value={(settings[key] as string) || ""}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Adres</label>
              <input
                value={(settings.address as string) || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Toptan Satış Duyurusu</label>
              <input
                value={(settings.wholesaleNotice as string) || ""}
                onChange={(e) => setSettings({ ...settings, wholesaleNotice: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Banka Bilgileri (Havale/EFT)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["bankName", "Banka Adı"],
              ["accountHolder", "Hesap Sahibi"],
              ["iban", "IBAN"],
            ].map(([key, label]) => (
              <div key={key} className={key === "iban" ? "sm:col-span-2" : ""}>
                <label className="block text-sm font-medium">{label}</label>
                <input
                  value={((settings.bankInfo as Record<string, string>) || {})[key] || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankInfo: {
                        ...((settings.bankInfo as Record<string, string>) || {}),
                        [key]: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gold px-8 py-2.5 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Ayarları Kaydet
        </button>
      </form>
    </div>
  );
}
