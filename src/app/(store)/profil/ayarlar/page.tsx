"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("Şifreniz güncellendi");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setError(data.error || "Hata oluştu");
    }
  }

  return (
    <div className="rounded-xl border p-6">
      <h2 className="text-lg font-bold">Şifre Değiştir</h2>
      <form onSubmit={handleSubmit} className="mt-4 max-w-md space-y-4">
        {message && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{message}</div>}
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium">Mevcut Şifre</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Yeni Şifre</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border px-4 py-2"
          />
        </div>
        <button type="submit" className="rounded-lg bg-gold px-6 py-2 text-brand-black hover:bg-gold-dark">
          Güncelle
        </button>
      </form>
    </div>
  );
}
