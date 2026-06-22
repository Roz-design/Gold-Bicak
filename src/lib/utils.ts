import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = `BS${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}${random}`;
}

export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function validateTcKimlik(tc: string): boolean {
  if (!/^\d{11}$/.test(tc) || tc[0] === "0") return false;
  const digits = tc.split("").map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  const check10 = (sumOdd * 7 - sumEven) % 10;
  if (check10 !== digits[9]) return false;
  const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  return sum10 % 10 === digits[10];
}

export function getUnitPrice(
  product: {
    priceAdet: number;
    pricePaket: number;
    priceKoli: number;
  },
  saleType: "ADET" | "PAKET" | "KOLI"
): number {
  switch (saleType) {
    case "ADET":
      return product.priceAdet;
    case "PAKET":
      return product.pricePaket;
    case "KOLI":
      return product.priceKoli;
  }
}

export function getSaleTypeLabel(saleType: string): string {
  switch (saleType) {
    case "ADET":
      return "Adet";
    case "PAKET":
      return "Paket";
    case "KOLI":
      return "Koli";
    default:
      return saleType;
  }
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SIPARIS_ALINDI: "Sipariş Alındı",
    ODEME_BEKLENIYOR: "Ödeme Bekleniyor",
    ODEME_BILDIRILDI: "Ödeme Bildirildi",
    ODEME_ONAYLANDI: "Ödeme Onaylandı",
    HAZIRLANIYOR: "Hazırlanıyor",
    KARGOYA_VERILDI: "Kargoya Verildi",
    TESLIM_EDILDI: "Teslim Edildi",
    IPTAL_EDILDI: "İptal Edildi",
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SIPARIS_ALINDI: "bg-blue-100 text-blue-800",
    ODEME_BEKLENIYOR: "bg-yellow-100 text-yellow-800",
    ODEME_BILDIRILDI: "bg-orange-100 text-orange-800",
    ODEME_ONAYLANDI: "bg-green-100 text-green-800",
    HAZIRLANIYOR: "bg-indigo-100 text-indigo-800",
    KARGOYA_VERILDI: "bg-purple-100 text-purple-800",
    TESLIM_EDILDI: "bg-emerald-100 text-emerald-800",
    IPTAL_EDILDI: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
