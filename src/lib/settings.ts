import { prisma } from "./db";

const DEFAULT_SETTINGS = {
  companyName: "GOLD BIÇAKÇILIK",
  logo: "/logo.svg",
  phone: "0532 582 21 44",
  whatsapp: "905325822144",
  email: "info@goldbicakcilik.com",
  address: "İstoç 2. Ada",
  workingHours: "Pazartesi - Cumartesi: 09:00 - 18:00",
  socialMedia: {
    instagram: "https://instagram.com/goldbicakcilik",
    facebook: "https://facebook.com/goldbicakcilik",
    youtube: "https://youtube.com/goldbicakcilik",
  },
  bankInfo: {
    bankName: "Ziraat Bankası",
    accountHolder: "Gold Bıçakçılık Ltd. Şti.",
    iban: "TR00 0000 0000 0000 0000 0000 00",
  },
  legalPages: {
    privacy: "Kişisel verileriniz KVKK kapsamında korunmaktadır.",
    distanceSales: "Mesafeli satış sözleşmesi metni burada yer alır.",
    kvkk: "KVKK aydınlatma metni burada yer alır.",
  },
  wholesaleNotice:
    "Toptan satış için özel fiyatlar! 250 adet ve üzeri siparişlerde ek indirim.",
};

export type SiteSettings = typeof DEFAULT_SETTINGS;

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSetting.findMany();
  if (settings.length === 0) return DEFAULT_SETTINGS;

  const merged = { ...DEFAULT_SETTINGS };
  for (const setting of settings) {
    try {
      const value = JSON.parse(setting.value);
      if (setting.key === "companyName") merged.companyName = value;
      else if (setting.key === "logo") merged.logo = value;
      else if (setting.key === "phone") merged.phone = value;
      else if (setting.key === "whatsapp") merged.whatsapp = value;
      else if (setting.key === "email") merged.email = value;
      else if (setting.key === "address") merged.address = value;
      else if (setting.key === "workingHours") merged.workingHours = value;
      else if (setting.key === "socialMedia") merged.socialMedia = value;
      else if (setting.key === "bankInfo") merged.bankInfo = value;
      else if (setting.key === "legalPages") merged.legalPages = value;
      else if (setting.key === "wholesaleNotice") merged.wholesaleNotice = value;
    } catch {
      // ignore parse errors
    }
  }
  return merged;
}

export async function updateSiteSetting(key: string, value: unknown) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}
