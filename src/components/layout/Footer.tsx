import Link from "next/link";
import LogoImage, { resolveLogoSrc } from "@/components/layout/LogoImage";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSiteSettings();
  const logoUrl = settings.logo || "/logo.svg";
  const displayLogo = resolveLogoSrc(logoUrl);

  return (
    <footer className="mt-auto border-t-4 border-gold bg-brand-black text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="mb-4 inline-block">
            <div className="h-12 w-36">
              <LogoImage
                src={displayLogo}
                alt={settings.companyName}
                className="h-full w-full object-contain object-left"
              />
            </div>
          </Link>
          <h3 className="mb-1 text-lg font-bold tracking-wide text-white">
            <span className="text-gold">GOLD</span> BIÇAKÇILIK
          </h3>
          <p className="mb-4 text-xs text-neutral-500">Profesyonel bıçak çözümleri</p>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {settings.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold" />
              {settings.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold" />
              {settings.email}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" />
              {settings.workingHours}
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold">Kategoriler</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/kategori/kasap-bicaklari" className="hover:text-gold transition-colors">Kasap Bıçakları</Link></li>
            <li><Link href="/kategori/av-bicaklari" className="hover:text-gold transition-colors">Av Bıçakları</Link></li>
            <li><Link href="/kategori/profesyonel-bicaklar" className="hover:text-gold transition-colors">Profesyonel Bıçaklar</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold">Yasal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/gizlilik" className="hover:text-gold transition-colors">Gizlilik Politikası</Link></li>
            <li><Link href="/mesafeli-satis" className="hover:text-gold transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
            <li><Link href="/kvkk" className="hover:text-gold transition-colors">KVKK Metni</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold">Sosyal Medya</h3>
          <div className="flex flex-wrap gap-2">
            <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:border-gold hover:text-gold transition-colors">Instagram</a>
            <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:border-gold hover:text-gold transition-colors">Facebook</a>
            <a href={settings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:border-gold hover:text-gold transition-colors">YouTube</a>
          </div>
          <p className="mt-4 text-sm">
            WhatsApp: <span className="text-gold">{settings.whatsapp}</span>
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-4 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} GOLD BIÇAKÇILIK. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
