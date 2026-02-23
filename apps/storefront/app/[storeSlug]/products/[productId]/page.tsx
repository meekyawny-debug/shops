"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ProductImages } from "@/components/product-images";
import { VariantSelector } from "@/components/variant-selector";
import { QuantitySelector } from "@/components/quantity-selector";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { PriceDisplay } from "@/components/price-display";
import { ProductCard } from "@/components/product-card";

export default function ProductDetailPage() {
  const params = useParams<{ storeSlug: string; productId: string }>();
  const { storeSlug, productId } = params;

  const { data: storeProduct, isLoading } =
    trpc.storefront.getProduct.useQuery({
      storeSlug,
      productId,
    });

  const { data: related } = trpc.storefront.getRelatedProducts.useQuery({
    storeSlug,
    productId,
    limit: 4,
  });

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-12 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!storeProduct) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const { product } = storeProduct;
  const variants = product.variants;
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0];

  if (!selectedVariant) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">No variants available</p>
      </div>
    );
  }

  const price = Number(
    storeProduct.priceOverride ?? selectedVariant.retailPrice
  );
  const compareAtPrice = selectedVariant.compareAtPrice
    ? Number(selectedVariant.compareAtPrice)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/${storeSlug}/products`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <ProductImages images={product.images as any} />

        {/* Details */}
        <div className="space-y-6">
          {product.category && (
            <span className="text-sm text-muted-foreground uppercase tracking-wide">
              {product.category}
            </span>
          )}
          <h1 className="font-heading text-3xl font-bold">{product.title}</h1>

          <PriceDisplay
            price={price}
            compareAtPrice={compareAtPrice}
            size="lg"
          />

          <div className="prose prose-sm text-muted-foreground max-w-none">
            <p>{product.description}</p>
          </div>

          <VariantSelector
            variants={variants.map((v) => ({
              id: v.id,
              name: v.name,
              stock: v.stock,
            }))}
            selectedId={selectedVariant.id}
            onSelect={(id) => {
              setSelectedVariantId(id);
              setQuantity(1);
            }}
          />

          <QuantitySelector
            quantity={quantity}
            maxStock={selectedVariant.stock}
            onChange={setQuantity}
          />

          {selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <p className="text-sm text-destructive">
              Only {selectedVariant.stock} left in stock
            </p>
          )}

          <AddToCartButton
            item={{
              variantId: selectedVariant.id,
              productId: product.id,
              productTitle: product.title,
              variantName: selectedVariant.name,
              price,
              compareAtPrice,
              quantity,
              image: product.images[0]?.url || null,
              stock: selectedVariant.stock,
            }}
          />
        </div>
      </div>

      {/* Related Products */}
      {related && related.length > 0 && (
        <section className="mt-16 pt-16 border-t">
          <h2 className="font-heading text-2xl font-bold mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((sp) => (
              <ProductCard
                key={sp.id}
                storeProduct={sp as any}
                storeSlug={storeSlug}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
