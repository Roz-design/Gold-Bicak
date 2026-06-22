import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";
import { handleAdminError, handlePrismaError } from "@/lib/admin-api";
import { slugify } from "@/lib/utils";

const PRODUCT_UPDATE_FIELDS = [
  "name",
  "code",
  "shortDescription",
  "description",
  "specifications",
  "stock",
  "priceAdet",
  "pricePaket",
  "paketQuantity",
  "priceKoli",
  "koliQuantity",
  "categoryId",
  "featured",
  "hidden",
] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product) return apiError("Ürün bulunamadı", 404);
    return apiSuccess(product);
  } catch (error) {
    return handleAdminError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const { images, ...rest } = body;
    const data: Record<string, unknown> = {};

    for (const field of PRODUCT_UPDATE_FIELDS) {
      if (rest[field] !== undefined) {
        data[field] = rest[field];
      }
    }

    if (typeof data.name === "string" && data.name !== rest.slug) {
      data.slug = slugify(data.name as string) + "-" + id.slice(-6);
    }

    await prisma.product.update({ where: { id }, data });

    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      const filtered = images.filter((url: string) => url && url.trim());
      if (filtered.length > 0) {
        await prisma.productImage.createMany({
          data: filtered.map((url: string, i: number) => ({
            productId: id,
            url,
            sortOrder: i,
          })),
        });
      }
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    await logAdminAction(admin.id, "PRODUCT_UPDATE", product?.name, getClientIp(request));
    return apiSuccess(product);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.delete({ where: { id } });
    await logAdminAction(admin.id, "PRODUCT_DELETE", product.name, getClientIp(request));
    return apiSuccess({ message: "Ürün silindi" });
  } catch (error) {
    return handleAdminError(error);
  }
}
