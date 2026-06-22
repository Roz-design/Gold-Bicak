import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const adminPasswordHash = await bcrypt.hash("Rozerin21.", 12);
  const userPasswordHash = await bcrypt.hash("User123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@probicak.com" },
    update: {
      username: "admin",
      passwordHash: adminPasswordHash,
      phoneVerified: true,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      firstName: "Admin",
      lastName: "Kullanıcı",
      tcKimlik: "11111111110",
      phone: "905551111111",
      email: "admin@probicak.com",
      username: "admin",
      passwordHash: adminPasswordHash,
      phoneVerified: true,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "musteri@example.com" },
    update: {},
    create: {
      firstName: "Ahmet",
      lastName: "Yılmaz",
      tcKimlik: "22222222220",
      phone: "905559999999",
      email: "musteri@example.com",
      passwordHash: userPasswordHash,
      phoneVerified: true,
      role: "USER",
      status: "ACTIVE",
    },
  });

  const categories = [
    {
      name: "Profesyonel Bıçaklar",
      slug: "profesyonel-bicaklar",
      sortOrder: 1,
      image: "/categories/profesyonel-bicaklar.jpg",
    },
    {
      name: "Kasap Bıçakları",
      slug: "kasap-bicaklari",
      sortOrder: 2,
      image: "/categories/kasap-bicaklari.jpg",
    },
    {
      name: "Av Bıçakları",
      slug: "av-bicaklari",
      sortOrder: 3,
      image: "/categories/av-bicaklari.jpg",
    },
    {
      name: "Kamp Bıçakları",
      slug: "kamp-bicaklari",
      sortOrder: 4,
      image: "/categories/kamp-bicaklari.jpg",
    },
    {
      name: "Çakı Modelleri",
      slug: "caki-modelleri",
      sortOrder: 5,
      image: "/categories/caki-modelleri.jpg",
    },
    {
      name: "Aksesuarlar",
      slug: "aksesuarlar",
      sortOrder: 6,
      image: "/categories/aksesuarlar.jpg",
    },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { sortOrder: cat.sortOrder, active: true, image: cat.image },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: `${cat.name} kategorisindeki profesyonel ürünler`,
        sortOrder: cat.sortOrder,
        image: cat.image,
      },
    });
    createdCategories[cat.slug] = c.id;
  }

  await prisma.category.updateMany({
    where: { slug: "mutfak-bicaklari" },
    data: { active: false },
  });

  const profesyonelCategoryId = createdCategories["profesyonel-bicaklar"];
  if (profesyonelCategoryId) {
    await prisma.product.updateMany({
      where: { slug: "sef-bicagi-20cm" },
      data: { categoryId: profesyonelCategoryId },
    });
  }

  const products = [
    {
      name: "Şef Bıçağı 20cm",
      slug: "sef-bicagi-20cm",
      code: "SB-2001",
      shortDescription: "Profesyonel mutfak şef bıçağı, yüksek karbon çelik",
      description:
        "Profesyonel mutfaklarda kullanılan 20cm şef bıçağı. Yüksek karbon çelikten üretilmiştir. Ergonomik sap tasarımı ile uzun süreli kullanımda konfor sağlar.",
      specifications: JSON.stringify({
        "Bıçak Uzunluğu": "20 cm",
        "Malzeme": "Yüksek Karbon Çelik",
        "Sap": "Ergonomic ABS",
        "Ağırlık": "220g",
      }),
      stock: 500,
      priceAdet: 100,
      pricePaket: 1080,
      paketQuantity: 12,
      priceKoli: 20000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "profesyonel-bicaklar",
      image: "/products/sef-bicagi-20cm.jpg",
    },
    {
      name: "Kasap Satırı 30cm",
      slug: "kasap-satiri-30cm",
      code: "KS-3001",
      shortDescription: "Profesyonel kasap satırı, dayanıklı çelik yapı",
      description:
        "Et ve kemik kesiminde kullanılan profesyonel kasap satırı. 30cm bıçak uzunluğu ile ağır işler için idealdir.",
      specifications: JSON.stringify({
        "Bıçak Uzunluğu": "30 cm",
        "Malzeme": "Paslanmaz Çelik",
        "Sap": "Ahşap",
        "Ağırlık": "450g",
      }),
      stock: 200,
      priceAdet: 250,
      pricePaket: 2700,
      paketQuantity: 12,
      priceKoli: 50000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "kasap-bicaklari",
      image: "/products/kasap-satiri-30cm.jpg",
    },
    {
      name: "Av Bıçağı 15cm",
      slug: "av-bicagi-15cm",
      code: "AV-1501",
      shortDescription: "Dayanıklı av bıçağı, deri kılıf dahil",
      description:
        "Avcılık ve outdoor aktiviteler için tasarlanmış 15cm av bıçağı. Deri kılıf dahildir.",
      specifications: JSON.stringify({
        "Bıçak Uzunluğu": "15 cm",
        "Malzeme": "440C Paslanmaz Çelik",
        "Sap": "G10 Fiber",
        "Kılıf": "Deri",
      }),
      stock: 150,
      priceAdet: 180,
      pricePaket: 2000,
      paketQuantity: 12,
      priceKoli: 38000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "av-bicaklari",
      image: "/products/av-bicagi-15cm.jpg",
    },
    {
      name: "Kamp Bıçağı Çok Amaçlı",
      slug: "kamp-bicagi-cok-amacli",
      code: "KB-1001",
      shortDescription: "Kompakt kamp bıçağı, çok amaçlı kullanım",
      description:
        "Kamp ve doğa aktiviteleri için kompakt çok amaçlı bıçak. Açacak, testereli bölüm dahil.",
      specifications: JSON.stringify({
        "Bıçak Uzunluğu": "12 cm",
        "Malzeme": "Paslanmaz Çelik",
        "Özellikler": "Açacak, Testereli",
      }),
      stock: 300,
      priceAdet: 75,
      pricePaket: 800,
      paketQuantity: 12,
      priceKoli: 15000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "kamp-bicaklari",
      image: "/products/kamp-bicagi-cok-amacli.jpg",
    },
    {
      name: "Klasik Çakı 85mm",
      slug: "klasik-caki-85mm",
      code: "CK-8501",
      shortDescription: "İsviçre tarzı klasik çakı, 85mm",
      description: "Günlük kullanım için ideal klasik çakı modeli. 85mm bıçak uzunluğu.",
      specifications: JSON.stringify({
        "Bıçak Uzunluğu": "85 mm",
        "Malzeme": "Paslanmaz Çelik",
        "Sap": "Alüminyum",
      }),
      stock: 400,
      priceAdet: 45,
      pricePaket: 480,
      paketQuantity: 12,
      priceKoli: 9000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "caki-modelleri",
      image: "/products/klasik-caki-85mm.jpg",
    },
    {
      name: "Bileme Taşı Seti",
      slug: "bileme-tasi-seti",
      code: "AK-1001",
      shortDescription: "Profesyonel bileme taşı seti, 3 parça",
      description: "Bıçak bakımı için profesyonel 3 parçalık bileme taşı seti.",
      specifications: JSON.stringify({
        "Parça Sayısı": "3",
        "Malzeme": "Doğal Bileme Taşı",
        "Kornalite": "1000/3000/6000",
      }),
      stock: 100,
      priceAdet: 120,
      pricePaket: 1300,
      paketQuantity: 12,
      priceKoli: 24000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "aksesuarlar",
      image: "/products/bileme-tasi-seti.jpg",
    },
    {
      name: "Santoku Bıçağı 18cm",
      slug: "santoku-bicagi-18cm",
      code: "ST-1801",
      shortDescription: "Japon tarzı santoku bıçağı, ince dilimleme",
      description:
        "Sebze, et ve balık kesiminde mükemmel performans sunan 18cm santoku bıçağı.",
      specifications: JSON.stringify({
        "Bıçak Uzunluğu": "18 cm",
        Malzeme: "VG-10 Paslanmaz Çelik",
        Sap: "Ergonomic Pakka Wood",
      }),
      stock: 220,
      priceAdet: 165,
      pricePaket: 1750,
      paketQuantity: 12,
      priceKoli: 33000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "profesyonel-bicaklar",
      image: "/products/santoku-bicagi-18cm.jpg",
    },
    {
      name: "Ekmek Bıçağı 20cm",
      slug: "ekmek-bicagi-20cm",
      code: "EB-2001",
      shortDescription: "Dişli ekmek bıçağı, paslanmaz çelik",
      description: "Ekmek ve hamur işleri için dişli 20cm ekmek bıçağı.",
      specifications: JSON.stringify({
        "Bıçak Uzunluğu": "20 cm",
        Malzeme: "Paslanmaz Çelik",
        Sap: "Siyah ABS",
      }),
      stock: 180,
      priceAdet: 95,
      pricePaket: 1020,
      paketQuantity: 12,
      priceKoli: 19000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "profesyonel-bicaklar",
      image: "/products/ekmek-bicagi-20cm.jpg",
    },
    {
      name: "Outdoor Survival Bıçağı",
      slug: "outdoor-survival-bicagi",
      code: "OS-1201",
      shortDescription: "Sağlam outdoor survival bıçağı, kılıflı",
      description: "Doğa ve survival kullanımı için dayanıklı outdoor bıçak.",
      specifications: JSON.stringify({
        "Bıçak Uzunluğu": "12 cm",
        Malzeme: "440C Paslanmaz Çelik",
        Kılıf: "Naylon",
      }),
      stock: 140,
      priceAdet: 210,
      pricePaket: 2250,
      paketQuantity: 12,
      priceKoli: 42000,
      koliQuantity: 250,
      featured: true,
      categorySlug: "kamp-bicaklari",
      image: "/products/outdoor-survival-bicagi.jpg",
    },
  ];

  for (const p of products) {
    const categoryId = createdCategories[p.categorySlug];
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        code: p.code,
        shortDescription: p.shortDescription,
        description: p.description,
        specifications: p.specifications,
        stock: p.stock,
        priceAdet: p.priceAdet,
        pricePaket: p.pricePaket,
        paketQuantity: p.paketQuantity,
        priceKoli: p.priceKoli,
        koliQuantity: p.koliQuantity,
        featured: p.featured,
        categoryId,
      },
      create: {
        name: p.name,
        slug: p.slug,
        code: p.code,
        shortDescription: p.shortDescription,
        description: p.description,
        specifications: p.specifications,
        stock: p.stock,
        priceAdet: p.priceAdet,
        pricePaket: p.pricePaket,
        paketQuantity: p.paketQuantity,
        priceKoli: p.priceKoli,
        koliQuantity: p.koliQuantity,
        featured: p.featured,
        categoryId,
      },
    });

    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id },
      orderBy: { sortOrder: "asc" },
    });

    if (existingImage) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: { url: p.image },
      });
    } else {
      await prisma.productImage.create({
        data: { productId: product.id, url: p.image, sortOrder: 0 },
      });
    }
  }

  await prisma.banner.upsert({
    where: { id: "hero-banner-1" },
    update: {
      title: "Profesyonel Bıçak Çözümleri",
      subtitle: "GOLD BIÇAKÇILIK — Perakende ve toptan satışa uygun fiyatlar",
      image: "/categories/profesyonel-bicaklar.jpg",
    },
    create: {
      id: "hero-banner-1",
      title: "Profesyonel Bıçak Çözümleri",
      subtitle: "GOLD BIÇAKÇILIK — Perakende ve toptan satışa uygun fiyatlar",
      image: "/categories/profesyonel-bicaklar.jpg",
      link: "/urunler",
      active: true,
      sortOrder: 0,
    },
  });

  const siteSettings = [
    { key: "companyName", value: "GOLD BIÇAKÇILIK" },
    { key: "logo", value: "/logo.svg" },
    { key: "email", value: "info@goldbicakcilik.com" },
    { key: "phone", value: "0532 582 21 44" },
    { key: "whatsapp", value: "905325822144" },
    { key: "address", value: "İstoç 2. Ada" },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: JSON.stringify(setting.value) },
      create: { key: setting.key, value: JSON.stringify(setting.value) },
    });
  }

  const existingOrders = await prisma.order.findMany({
    select: { id: true, status: true },
  });
  for (const order of existingOrders) {
    const historyCount = await prisma.orderStatusHistory.count({
      where: { orderId: order.id },
    });
    if (historyCount === 0) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: order.status,
          note: "Sipariş kaydı",
        },
      });
    }
  }

  await prisma.campaign.upsert({
    where: { id: "campaign-1" },
    update: {},
    create: {
      id: "campaign-1",
      title: "Toptan Alımlarda %10 İndirim",
      description: "250 adet ve üzeri koli alımlarında geçerli",
      discountPercent: 10,
      active: true,
    },
  });

  console.log("Seed tamamlandı!");
  console.log("Admin: Admin veya admin@probicak.com");
  console.log("Müşteri: musteri@example.com / User123!");
  console.log("Gizli admin giriş: /gb-panel-x7k9m2/giris");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
