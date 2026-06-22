import Link from "next/link";
import { Phone, ShoppingCart, User, LogIn } from "lucide-react";
import LogoImage, { resolveLogoSrc } from "@/components/layout/LogoImage";
import { getSiteSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Header() {
  const settings = await getSiteSettings();
  const user = await getCurrentUser();

  let cartCount = 0;
  if (user) {
    cartCount = await prisma.cartItem.count({ where: { userId: user.id } });
  }

  const logoUrl = settings.logo || "/logo.svg";
  const displayLogo = resolveLogoSrc(logoUrl);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white shadow-sm">
      <div className="bg-brand-black py-2 text-center text-sm font-medium tracking-wide text-gold">
        {settings.wholesaleNotice}
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="h-10 w-28 shrink-0 sm:h-12 sm:w-40">
            <LogoImage
              src={displayLogo}
              alt={settings.companyName}
              className="h-full w-full object-contain object-left"
              priority
            />
          </div>
          <div className="hidden items-center gap-1 text-xs text-neutral-500 sm:flex">
            <Phone className="h-3 w-3 shrink-0 text-gold" />
            <span className="truncate">{settings.phone}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/urunler" className="text-sm font-medium text-brand-black hover:text-gold transition-colors">
            Ürünler
          </Link>
          <Link href="/siparis-takip" className="text-sm font-medium text-brand-black hover:text-gold transition-colors">
            Sipariş Takip
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link
              href="/profil"
              className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-brand-black hover:border-gold hover:text-gold transition-colors"
            >
              <User className="h-4 w-4" />
              <span>
                {user.role === "ADMIN" ? "Hesabım" : user.firstName}
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/giris"
                className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-brand-black hover:border-gold hover:text-gold transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Oturum Aç</span>
              </Link>
              <Link
                href="/kayit"
                className="hidden rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-brand-black hover:bg-gold-dark sm:block transition-colors"
              >
                Kayıt Ol
              </Link>
            </>
          )}
          <Link
            href="/sepet"
            className="relative flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-brand-black hover:border-gold transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-brand-black">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
