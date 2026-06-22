import { prisma } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { hidden: false },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Tüm Ürünler</h1>
      <p className="mt-2 text-slate-500">{products.length} ürün listeleniyor</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
