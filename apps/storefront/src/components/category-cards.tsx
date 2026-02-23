"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { trpc } from "@/lib/trpc";

export function CategoryCards() {
  const store = useStore();
  const { data: categories } = trpc.storefront.getCategories.useQuery({
    storeSlug: store.slug,
  });

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/${store.slug}/products?category=${encodeURIComponent(category)}`}
              className="group relative overflow-hidden rounded-lg bg-muted p-6 text-center hover:bg-muted/80 transition-colors"
            >
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {category}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
