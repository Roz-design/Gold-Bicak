import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";
import { handleAdminError, handlePrismaError } from "@/lib/admin-api";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(products);
  } catch (error) {
    return handleAdminError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const {
      name,
      code,
      shortDescription,
      description,
      specifications,
      stock,
      priceAdet,
      pricePaket,
      paketQuantity,
      priceKoli,
      koliQuantity,
      categoryId,
      featured,
      hidden,
      images,
    } = body;

    if (!name?.trim()) return apiError("Ürün adı zorunludur", 400);
    if (!code?.trim()) return apiError("Ürün kodu zorunludur", 400);
    if (!categoryId) return apiError("Kategori seçiniz", 400);

    const existingCode = await prisma.product.findUnique({ where: { code: code.trim() } });
    if (existingCode) return apiError("Bu ürün kodu zaten kullanılıyor", 409);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: slugify(name) + "-" + Date.now().toString(36),
        code: code.trim(),
        shortDescription: shortDescription?.trim() || "",
        description: description?.trim() || "",
        specifications: specifications || "{}",
        stock: Number(stock) || 0,
        priceAdet: Number(priceAdet) || 0,
        pricePaket: Number(pricePaket) || 0,
        paketQuantity: Number(paketQuantity) || 12,
        priceKoli: Number(priceKoli) || 0,
        koliQuantity: Number(koliQuantity) || 250,
        categoryId,
        featured: !!featured,
        hidden: !!hidden,
        images: images?.filter((url: string) => url?.trim())?.length
          ? {
              create: images
                .filter((url: string) => url?.trim())
                .map((url: string, i: number) => ({ url: url.trim(), sortOrder: i })),
            }
          : undefined,
      },
      include: { category: true, images: true },
    });

    await logAdminAction(admin.id, "PRODUCT_CREATE", product.name, getClientIp(request));
    return apiSuccess(product, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
