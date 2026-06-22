# Pro Bıçak E-Ticaret Sistemi

Profesyonel bıçak satış e-ticaret sitesi ve yönetim paneli.

## Özellikler

### Mağaza
- Sabit header (logo, telefon, giriş, sepet, sipariş takip)
- Ana sayfa (hero, kampanya, kategoriler, öne çıkan ürünler)
- Adet / Paket / Koli satış birimleri ve dinamik fiyat hesaplama
- Üyelik zorunlu sipariş (SMS doğrulama)
- Sepet, havale/EFT ödeme, ödeme bildirimi
- Kullanıcı profili (adresler, siparişler, favoriler, şifre)
- WhatsApp destek butonu
- Sipariş takip

### Admin Panel (`/admin`)
- Dashboard (istatistikler, son siparişler)
- Ürün / kategori / sipariş / üye yönetimi
- Sipariş durumu ve kargo takip no
- Raporlama (günlük/haftalık/aylık satış, top ürünler, stok)
- Site ayarları (banka bilgileri, iletişim)

## Teknoloji

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Veritabanı:** Neon PostgreSQL (Vercel) / PostgreSQL
- **ORM:** Prisma 6

> **Not:** Laravel tercih edilmişti ancak geliştirme ortamında PHP yüklü değildi. Üretim VPS'te Laravel API'ye geçiş veya mevcut Next.js full-stack yapısı kullanılabilir.

## Kurulum

```bash
cd bicak-satis
npm install
cp .env.example .env
# .env içinde Neon DATABASE_URL ve DIRECT_URL değerlerini doldurun
npm run db:setup
npm run dev
```

Site: http://localhost:3000

## Vercel + Neon PostgreSQL

1. [Neon](https://neon.tech) üzerinde proje oluşturun.
2. **Pooled** connection string → Vercel `DATABASE_URL` (zorunlu)
3. İsteğe bağlı: **Direct** string → `DIRECT_URL` (yoksa build script otomatik türetir)
4. Vercel ortam değişkenleri: `JWT_SECRET`, `ADMIN_SECRET_PATH`, `NEXT_PUBLIC_ADMIN_SECRET_PATH`, `NEXT_PUBLIC_SITE_URL`
5. Deploy sırasında `npm run build` otomatik olarak `prisma migrate deploy` çalıştırır.
6. İlk deploy sonrası seed için (bir kez): `npm run db:seed` (Neon SQL Editor veya lokal `.env` ile)

> **Not:** Vercel'de `public/uploads/` kalıcı değildir. Ürün görselleri için harici URL veya Vercel Blob / S3 kullanın.

## Demo Hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | Admin veya admin@probicak.com | Rozerin21. |
| Müşteri | musteri@example.com | User123! |

## SMS Doğrulama

Geliştirmede `SMS_MOCK=true` ile kod konsola yazılır ve kayıt ekranında gösterilir.

## Üretim Dağıtımı

1. Neon PostgreSQL `DATABASE_URL` (pooled) ve `DIRECT_URL` (direct) tanımlayın
2. `JWT_SECRET` güçlü bir değer atayın
3. `SMS_MOCK=false` ve SMS API anahtarlarını ekleyin
4. Vercel'e deploy edin veya Node.js sunucusunda `npm run build && npm start`

## Proje Yapısı

```
src/
  app/
    (store)/     # Mağaza sayfaları
    admin/       # Yönetim paneli
    api/         # REST API
  components/    # UI bileşenleri
  lib/           # Auth, DB, utils
prisma/          # Şema ve seed
```
