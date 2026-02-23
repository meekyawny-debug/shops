"use client";

import { useParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";

export default function ProductsPage() {
  const params = useParams<{ storeSlug: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">All Products</h1>
      <ProductGrid storeSlug={params.storeSlug} />
    </div>
  );
}
