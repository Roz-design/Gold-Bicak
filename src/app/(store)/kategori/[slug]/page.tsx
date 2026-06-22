import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findFirst({
    where: { slug, active: true },
  });

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, hidden: false },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-slate-500">{category.description}</p>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="mt-8 text-center text-slate-500">Bu kategoride henüz ürün yok.</p>
      )}
    </div>
  );
}
