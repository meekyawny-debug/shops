"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { trpc } from "@/lib/trpc";

const storeGradients: Record<string, string[]> = {
  glowhaven: [
    "from-pink-100 to-rose-200",
    "from-fuchsia-100 to-pink-200",
    "from-rose-100 to-pink-200",
    "from-pink-50 to-fuchsia-200",
    "from-rose-50 to-rose-200",
    "from-pink-100 to-fuchsia-100",
  ],
  aurae: [
    "from-amber-100 to-yellow-200",
    "from-yellow-100 to-amber-200",
    "from-orange-100 to-amber-200",
    "from-amber-50 to-yellow-200",
    "from-yellow-50 to-orange-200",
    "from-amber-100 to-orange-100",
  ],
  nestwell: [
    "from-orange-100 to-amber-200",
    "from-stone-100 to-orange-200",
    "from-amber-100 to-stone-200",
    "from-orange-50 to-stone-200",
    "from-stone-100 to-amber-200",
    "from-amber-50 to-orange-200",
  ],
};

const defaultGradients = [
  "from-muted to-muted/80",
  "from-muted to-muted/70",
  "from-muted/80 to-muted",
];

export function CategoryCards() {
  const store = useStore();
  const { data: categories } = trpc.storefront.getCategories.useQuery({
    storeSlug: store.slug,
  });

  if (!categories || categories.length === 0) return null;

  const gradients = storeGradients[store.slug] || defaultGradients;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, i) => (
            <Link
              key={category}
              href={`/${store.slug}/products?category=${encodeURIComponent(category)}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] flex flex-col items-center justify-center transition-transform duration-300 hover:scale-[1.02]"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} transition-opacity duration-300`}
              />
              <div className="relative z-10 text-center space-y-2 p-6">
                <h3 className="font-heading text-lg font-semibold">
                  {category}
                </h3>
                <span className="text-sm text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
