"use client";

import Image from "next/image";
import Link from "next/link";
import { PriceDisplay } from "./price-display";
import type { StoreProductWithDetails } from "@/lib/types";

export function ProductCard({
  storeProduct,
  storeSlug,
}: {
  storeProduct: StoreProductWithDetails;
  storeSlug: string;
}) {
  const { product } = storeProduct;
  const firstImage = product.images[0];
  const firstVariant = product.variants[0];

  if (!firstVariant) return null;

  const price = Number(
    storeProduct.priceOverride ?? firstVariant.retailPrice
  );
  const compareAtPrice = firstVariant.compareAtPrice
    ? Number(firstVariant.compareAtPrice)
    : null;

  return (
    <Link
      href={`/${storeSlug}/products/${product.id}`}
      className="group block"
    >
      <div className="aspect-square relative rounded-lg overflow-hidden bg-muted mb-3">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.alt || product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
        {product.title}
      </h3>
      <PriceDisplay price={price} compareAtPrice={compareAtPrice} size="sm" />
    </Link>
  );
}
