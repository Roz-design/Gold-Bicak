import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ProductDetailClient from "@/components/product/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, user] = await Promise.all([
    prisma.product.findFirst({
      where: { slug, hidden: false },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
    getCurrentUser(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ProductDetailClient product={product} isLoggedIn={!!user} />
    </div>
  );
}
