"use client";

import Link from "next/link";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { getCategoryImage } from "@/lib/category-images";

interface CategoryGridProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
  }>;
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
      {categories.map((cat) => {
        const imageSrc = getCategoryImage(cat.slug, cat.image);

        return (
          <Link
            key={cat.id}
            href={`/kategori/${cat.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm outline-none transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-gold hover:shadow-xl focus-visible:ring-2 focus-visible:ring-gold active:scale-[0.96] active:translate-y-0 active:border-gold-dark active:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200">
              <FlexibleImage
                src={imageSrc}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-active:scale-105"
                sizes="(max-width:640px) 50vw, 250px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/85 via-brand-black/25 to-transparent transition-opacity duration-300 group-hover:from-brand-black/90" />
              <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3 transition-transform duration-300 group-hover:translate-y-0 group-active:translate-y-0.5">
                <span className="text-sm font-semibold leading-snug text-white drop-shadow-sm">
                  {cat.name}
                </span>
              </div>
              <div className="pointer-events-none absolute inset-0 opacity-0 ring-2 ring-inset ring-gold transition-opacity duration-200 group-active:opacity-100" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
