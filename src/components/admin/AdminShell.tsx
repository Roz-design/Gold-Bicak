"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoImage from "@/components/layout/LogoImage";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
  Megaphone,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { adminPath, adminApiPath } from "@/lib/admin-path";
import { cn } from "@/lib/utils";

const navItems = [
  { href: adminPath(), label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: adminPath("/urunler"), label: "Ürünler", icon: Package },
  { href: adminPath("/kategoriler"), label: "Kategoriler", icon: FolderOpen },
  { href: adminPath("/kampanyalar"), label: "Kampanyalar", icon: Megaphone },
  { href: adminPath("/siparisler"), label: "Siparişler", icon: ShoppingCart },
  { href: adminPath("/uyeler"), label: "Üyeler", icon: Users },
  { href: adminPath("/raporlar"), label: "Raporlar", icon: BarChart3 },
  { href: adminPath("/ayarlar"), label: "Ayarlar", icon: Settings },
];

interface AdminShellProps {
  children: React.ReactNode;
  user: { firstName: string; lastName: string };
}

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [logo, setLogo] = useState("/logo.svg");
  const [companyName, setCompanyName] = useState("GOLD BIÇAKÇILIK");

  useEffect(() => {
    fetch(adminApiPath("/settings"))
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.data.logo) setLogo(d.data.logo);
          if (d.data.companyName) setCompanyName(d.data.companyName);
        }
      })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(adminPath("/giris"));
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <aside className="flex w-64 shrink-0 flex-col bg-brand-black text-white">
        <div className="border-b border-neutral-800 p-4">
          <Link href={adminPath()} className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gold/30 bg-brand-black p-1">
              <LogoImage
                src={logo}
                alt={companyName}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold leading-tight">
                <span className="text-gold">GOLD</span>{" "}
                <span className="text-sm font-semibold">BIÇAKÇILIK</span>
              </div>
              <div className="text-xs text-neutral-500">Yönetim Paneli</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive(item.href, item.exact)
                  ? "bg-gold text-brand-black font-semibold"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-gold"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-neutral-800 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-900 hover:text-gold"
          >
            <ExternalLink className="h-4 w-4" />
            Siteyi Görüntüle
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-900 hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Mağazaya Dön
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-950 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm">
          <div />
          <div className="text-sm text-slate-600">
            Hoş geldiniz,{" "}
            <span className="font-semibold text-slate-900">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
