"use client";

import { adminPath, adminApiPath } from "@/lib/admin-path";
import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Megaphone } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  discountPercent: number | null;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
}

const emptyForm = {
  title: "",
  description: "",
  discountPercent: "",
  active: true,
  startDate: "",
  endDate: "",
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function loadCampaigns() {
    fetch(adminApiPath("/campaigns"))
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCampaigns(d.data);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEdit(campaign: Campaign) {
    setEditingId(campaign.id);
    setForm({
      title: campaign.title,
      description: campaign.description || "",
      discountPercent: campaign.discountPercent?.toString() || "",
      active: campaign.active,
      startDate: campaign.startDate ? campaign.startDate.split("T")[0] : "",
      endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      discountPercent: form.discountPercent ? parseFloat(form.discountPercent) : null,
      active: form.active,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    const url = editingId ? adminApiPath(`/campaigns/${editingId}`) : adminApiPath("/campaigns");
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      setSuccess(editingId ? "Kampanya güncellendi" : "Kampanya eklendi");
      setShowForm(false);
      loadCampaigns();
    } else {
      setError(data.error || "Kayıt başarısız");
    }
    setSaving(false);
  }

  async function deleteCampaign(id: string, title: string) {
    if (!confirm(`"${title}" kampanyasını silmek istediğinize emin misiniz?`)) return;
    const res = await fetch(adminApiPath(`/campaigns/${id}`), { method: "DELETE" });
    const data = await res.json();
    if (data.success) loadCampaigns();
    else alert(data.error);
  }

  async function toggleActive(campaign: Campaign) {
    await fetch(adminApiPath(`/campaigns/${campaign.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !campaign.active }),
    });
    loadCampaigns();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kampanya Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">Ana sayfada görünen kampanya duyuruları</p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-brand-black hover:bg-gold-dark"
          >
            <Plus className="h-4 w-4" /> Yeni Kampanya
          </button>
        )}
      </div>

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold">{editingId ? "Kampanyayı Düzenle" : "Yeni Kampanya"}</h2>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div>
            <label className="block text-sm font-medium">Kampanya Başlığı *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Toptan Alımlarda %10 İndirim"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-gold-dark focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="250 adet ve üzeri koli alımlarında geçerli"
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">İndirim Oranı (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                placeholder="10"
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Başlangıç Tarihi</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Bitiş Tarihi</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded text-gold"
            />
            Kampanya aktif (ana sayfada göster)
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gold px-6 py-2 text-brand-black hover:bg-gold-dark disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Güncelle" : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-6 py-2 text-sm hover:bg-slate-50"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yükleniyor...
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`rounded-xl border bg-white p-5 shadow-sm ${!campaign.active ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gold-light p-2">
                    <Megaphone className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{campaign.title}</h3>
                    {campaign.discountPercent && (
                      <span className="text-sm font-bold text-gold">%{campaign.discountPercent} indirim</span>
                    )}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    campaign.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {campaign.active ? "Aktif" : "Pasif"}
                </span>
              </div>

              {campaign.description && (
                <p className="mt-3 text-sm text-slate-600">{campaign.description}</p>
              )}

              {(campaign.startDate || campaign.endDate) && (
                <p className="mt-2 text-xs text-slate-400">
                  {campaign.startDate && new Date(campaign.startDate).toLocaleDateString("tr-TR")}
                  {campaign.startDate && campaign.endDate && " — "}
                  {campaign.endDate && new Date(campaign.endDate).toLocaleDateString("tr-TR")}
                </p>
              )}

              <div className="mt-4 flex gap-2 border-t pt-4">
                <button
                  onClick={() => openEdit(campaign)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Düzenle
                </button>
                <button
                  onClick={() => toggleActive(campaign)}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  {campaign.active ? "Pasifleştir" : "Aktifleştir"}
                </button>
                <button
                  onClick={() => deleteCampaign(campaign.id, campaign.title)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Sil
                </button>
              </div>
            </div>
          ))}

          {campaigns.length === 0 && !showForm && (
            <div className="col-span-full rounded-xl border-2 border-dashed py-12 text-center text-slate-500">
              Henüz kampanya yok. Yeni kampanya ekleyin.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
