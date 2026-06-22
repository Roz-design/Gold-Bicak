import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, hidden: false },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) return apiError("Ürün bulunamadı", 404);

  return apiSuccess(product);
}
