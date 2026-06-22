import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import ProductCard from "@/components/product/ProductCard";
import CategoryGrid from "@/components/home/CategoryGrid";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { ArrowRight, Truck, Shield, Headphones } from "lucide-react";

export const dynamic = "force-dynamic";

const HERO_FALLBACK_IMAGE = "/categories/profesyonel-bicaklar.jpg";

async function getHomePageData() {
  const settings = await getSiteSettings();

  try {
    const [featuredProducts, categories, banners, campaigns] = await Promise.all([
      prisma.product.findMany({
        where: { hidden: false, featured: true },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        take: 9,
      }),
      prisma.category.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.banner.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      }),
      prisma.campaign.findMany({
        where: {
          active: true,
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: new Date() }, endDate: null },
            { startDate: null, endDate: { gte: new Date() } },
            { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
          ],
        },
        take: 3,
      }),
    ]);

    return { featuredProducts, categories, banners, campaigns, settings };
  } catch (error) {
    console.error("[homepage] Veritabanı hatası:", error);
    return {
      featuredProducts: [],
      categories: [],
      banners: [],
      campaigns: [],
      settings,
    };
  }
}

export default async function HomePage() {
  const { featuredProducts, categories, banners, campaigns, settings } =
    await getHomePageData();

  const hero = banners[0];
  const heroImage = hero?.image || HERO_FALLBACK_IMAGE;

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-brand-black text-white">
        <div className="absolute inset-0 opacity-30">
          <FlexibleImage
            src={heroImage}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/90 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              GOLD BIÇAKÇILIK
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              {hero?.title || "Profesyonel Bıçak Çözümleri"}
            </h1>
            <p className="mt-4 text-lg text-neutral-300">
              {hero?.subtitle || "Perakende ve toptan satışa uygun, kaliteli bıçaklar"}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/urunler"
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-brand-black hover:bg-gold-dark transition-colors"
              >
                Ürünleri İncele
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kayit"
                className="rounded-lg border-2 border-gold px-6 py-3 font-medium text-gold hover:bg-gold hover:text-brand-black transition-colors"
              >
                Toptan Satış
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <section className="border-y border-gold/30 bg-gold-light py-4">
          <div className="mx-auto max-w-7xl px-4">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-center gap-2 text-center text-brand-black">
                <span className="font-bold text-gold-dark">{c.title}</span>
                {c.description && <span className="text-sm">— {c.description}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="border-b border-neutral-100 bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3">
          {[
            { icon: Truck, title: "Hızlı Kargo", desc: "Türkiye geneli teslimat" },
            { icon: Shield, title: "Güvenli Alışveriş", desc: "SSL korumalı ödeme" },
            { icon: Headphones, title: "7/24 Destek", desc: "WhatsApp sipariş hattı" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="rounded-full border-2 border-gold bg-white p-3">
                <Icon className="h-6 w-6 text-gold" />
              </div>
              <div>
                <div className="font-semibold text-brand-black">{title}</div>
                <div className="text-sm text-neutral-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-black">
              <span className="border-b-2 border-gold pb-1">Kategoriler</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
              Profesyonel ve günlük kullanıma uygun bıçak koleksiyonumuzu keşfedin
            </p>
          </div>
          {categories.length > 0 ? (
            <CategoryGrid categories={categories} />
          ) : (
            <p className="mt-8 text-center text-sm text-neutral-500">
              Kategoriler yükleniyor veya henüz eklenmedi.
            </p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-black">Öne Çıkan Ürünler</h2>
            <Link href="/urunler" className="text-sm font-semibold text-gold hover:text-gold-dark">
              Tümünü Gör →
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-neutral-500">
              Henüz öne çıkan ürün yok. Admin panelden ürün ekleyebilirsiniz.
            </p>
          )}
        </div>
      </section>

      {/* Wholesale CTA */}
      <section className="bg-brand-black py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Toptan Satış</p>
          <h2 className="mt-2 text-2xl font-bold">Kurumsal Fiyat Avantajları</h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-400">
            {settings.wholesaleNotice}
          </p>
          <Link
            href="/urunler"
            className="mt-6 inline-block rounded-lg bg-gold px-8 py-3 font-semibold text-brand-black hover:bg-gold-dark transition-colors"
          >
            Toptan Fiyatları İncele
          </Link>
        </div>
      </section>
    </div>
  );
}
