"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import { adminPath } from "@/lib/admin-path";

export default function AdminLoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.data.user.role !== "ADMIN") {
          setError("Bu hesap admin yetkisine sahip değil.");
          await fetch("/api/auth/logout", { method: "POST" });
          setLoading(false);
          return;
        }
        window.location.assign(adminPath());
        return;
      }

      setError(data.error || "Giriş başarısız. Kullanıcı adı/e-posta veya şifre kontrol edin.");
    } catch {
      setError("Sunucuya bağlanılamadı. `npm run dev` çalışıyor mu kontrol edin.");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-black via-neutral-900 to-brand-black px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold shadow-lg shadow-gold/20">
            <Shield className="h-8 w-8 text-brand-black" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">GOLD BIÇAKÇILIK</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Admin Paneli</h1>
          <p className="mt-2 text-sm text-neutral-400">Yönetim paneline giriş yapın</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-8 shadow-xl backdrop-blur"
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                E-posta veya Kullanıcı Adı
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoComplete="username"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-white focus:border-gold-dark focus:outline-none focus:ring-1 focus:ring-gold-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-white focus:border-gold-dark focus:outline-none focus:ring-1 focus:ring-gold-dark"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← Mağazaya dön
          </Link>
        </p>
      </div>
    </div>
  );
}
