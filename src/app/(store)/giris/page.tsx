"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";

function LoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    const data = await res.json();
    if (data.success) {
      if (data.data.user.role === "ADMIN") {
        window.location.assign(adminPath());
        return;
      }
      router.push(redirect);
      router.refresh();
    } else {
      setError(data.error || "Giriş başarısız");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-center">Giriş Yap</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium">E-posta veya Kullanıcı Adı</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            autoComplete="username"
            className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-gold focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold py-3 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="text-gold hover:underline">Kayıt Ol</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
