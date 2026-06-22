import { prisma } from "@/lib/db";
import { apiSuccess } from "@/lib/api";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return apiSuccess(categories);
}
