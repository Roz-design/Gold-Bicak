"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    tcKimlik: "",
    phone: "",
    email: "",
    password: "",
  });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      if (data.data.requiresVerification) {
        setPhone(form.phone);
        setDevCode(data.data.devCode || "");
        setStep("verify");
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      setError(data.error || "Kayıt başarısız");
    }
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });

    const data = await res.json();
    if (data.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(data.error || "Doğrulama başarısız");
    }
    setLoading(false);
  }

  if (step === "verify") {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold text-center">Telefon Doğrulama</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          {phone} numarasına gönderilen 6 haneli kodu giriniz
        </p>
        {devCode && (
          <p className="mt-2 rounded-lg bg-gold-light p-3 text-center text-sm text-gold-dark">
            Geliştirme kodu: <strong>{devCode}</strong>
          </p>
        )}
        <form onSubmit={handleVerify} className="mt-8 space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6 haneli kod"
            maxLength={6}
            required
            className="w-full rounded-lg border px-4 py-3 text-center text-2xl tracking-widest focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold py-3 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
          >
            {loading ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-center">Kayıt Ol</h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Sipariş verebilmek için üye olmanız gerekmektedir
      </p>
      <form onSubmit={handleRegister} className="mt-8 space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Ad</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Soyad</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
        </div>
        {[
          { key: "tcKimlik", label: "T.C. Kimlik No", type: "text" },
          { key: "phone", label: "Telefon", type: "tel" },
          { key: "email", label: "E-posta", type: "email" },
          { key: "password", label: "Şifre", type: "password" },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium">{field.label}</label>
            <input
              type={field.type}
              value={form[field.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold py-3 font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Kayıt Ol"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="text-gold hover:underline">Giriş Yap</Link>
      </p>
    </div>
  );
}
