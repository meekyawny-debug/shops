"use client";

import { useParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";

export default function ProductsPage() {
  const params = useParams<{ storeSlug: string }>();
  const storeSlug = params?.storeSlug;

  if (!storeSlug) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <span className="text-sm font-medium uppercase tracking-widest text-primary/70 mb-2 block">
          Browse
        </span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          All Products
        </h1>
        <p className="text-muted-foreground">
          Explore our full collection of curated products.
        </p>
      </div>
      <ProductGrid storeSlug={storeSlug} />
    </div>
  );
}
