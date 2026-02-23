"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ProductImages } from "@/components/product-images";
import { VariantSelector } from "@/components/variant-selector";
import { QuantitySelector } from "@/components/quantity-selector";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { PriceDisplay } from "@/components/price-display";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/lib/store-context";
import { trackViewContent } from "@/lib/meta-pixel";

export default function ProductDetailPage() {
  const params = useParams<{ storeSlug: string; productId: string }>();
  const storeSlug = params?.storeSlug;
  const productId = params?.productId;

  const { data: storeProduct, isLoading, error } =
    trpc.storefront.getProduct.useQuery(
      { storeSlug: storeSlug!, productId: productId! },
      { enabled: !!storeSlug && !!productId }
    );

  const { data: related } = trpc.storefront.getRelatedProducts.useQuery(
    { storeSlug: storeSlug!, productId: productId!, limit: 4 },
    { enabled: !!storeSlug && !!productId }
  );

  const store = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  // Fire Meta Pixel ViewContent event (must be before conditional returns per Rules of Hooks)
  useEffect(() => {
    if (!store.config?.fbPixelId || !storeProduct) return;
    const product = storeProduct.product;
    const selectedVar =
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants[0];
    if (!selectedVar) return;
    const p = Number(storeProduct.priceOverride ?? selectedVar.retailPrice);
    trackViewContent(product.id, product.title, product.category ?? null, p);
  }, [storeProduct?.product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!storeSlug || !productId) return null;

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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Unable to load this product. It may have been removed or is temporarily unavailable.
        </p>
        <Link
          href={`/${storeSlug}/products`}
          className="inline-flex items-center mt-4 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
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
        <ProductImages images={product.images} />

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
                storeProduct={sp}
                storeSlug={storeSlug}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
