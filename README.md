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
- **Veritabanı:** SQLite (geliştirme) / MySQL (üretim)
- **ORM:** Prisma 6

> **Not:** Laravel tercih edilmişti ancak geliştirme ortamında PHP yüklü değildi. Üretim VPS'te Laravel API'ye geçiş veya mevcut Next.js full-stack yapısı kullanılabilir.

## Kurulum

```bash
cd C:\Users\mavs\Projects\bicak-satis
npm install
npm run db:setup
npm run dev
```

Site: http://localhost:3000

## Demo Hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@probicak.com | Admin123! |
| Müşteri | musteri@example.com | User123! |

## SMS Doğrulama

Geliştirmede `SMS_MOCK=true` ile kod konsola yazılır ve kayıt ekranında gösterilir.

## Üretim Dağıtımı

1. `.env` dosyasında `DATABASE_URL` MySQL bağlantısına çevirin
2. `JWT_SECRET` güçlü bir değer atayın
3. `SMS_MOCK=false` ve SMS API anahtarlarını ekleyin
4. Linux VPS + Nginx + PM2 ile deploy edin

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
