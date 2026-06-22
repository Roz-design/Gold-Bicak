import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50");

  const products = await prisma.product.findMany({
    where: {
      hidden: false,
      ...(category ? { category: { slug: category } } : {}),
      ...(featured === "true" ? { featured: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } },
              { shortDescription: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return apiSuccess(products);
}
