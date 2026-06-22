"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MapPin, Package, Heart, Settings, LogOut } from "lucide-react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.data.user);
        else router.push("/giris?redirect=/profil");
      });
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/profil", label: "Kişisel Bilgiler", icon: User },
    { href: "/profil/adresler", label: "Adreslerim", icon: MapPin },
    { href: "/profil/siparisler", label: "Sipariş Geçmişi", icon: Package },
    { href: "/profil/favoriler", label: "Favoriler", icon: Heart },
    { href: "/profil/ayarlar", label: "Hesap Ayarları", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        Merhaba, {user ? `${user.firstName} ${user.lastName}` : "..."}
      </h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm hover:bg-slate-100"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </nav>
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
