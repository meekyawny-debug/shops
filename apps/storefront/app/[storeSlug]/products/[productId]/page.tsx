"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, AlertCircle, Truck, ShieldCheck, RotateCcw, ShoppingBag } from "lucide-react";
import { Button } from "@shops/ui";
import { trpc } from "@/lib/trpc";
import { ProductImages } from "@/components/product-images";
import { VariantSelector } from "@/components/variant-selector";
import { QuantitySelector } from "@/components/quantity-selector";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { PriceDisplay } from "@/components/price-display";
import { ProductCard } from "@/components/product-card";
import { FreeShippingBar } from "@/components/free-shipping-bar";
import { StarRating } from "@/components/star-rating";
import { ReviewSection } from "@/components/review-section";
import { StockScarcityBar } from "@/components/stock-scarcity-bar";
import { ViewersCount } from "@/components/viewers-count";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/lib/cart-context";
import { trackViewContent, trackAddToCart } from "@/lib/meta-pixel";
import { formatPrice } from "@/lib/utils";

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

  const { data: reviewData } = trpc.storefront.getProductReviews.useQuery(
    { storeSlug: storeSlug!, productId: productId!, limit: 1 },
    { enabled: !!storeSlug && !!productId }
  );

  const store = useStore();

  const { addItem } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for sticky mobile bar
  useEffect(() => {
    const el = addToCartRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [storeProduct]);

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
          <div className="aspect-square bg-muted rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-14 bg-muted rounded-full w-full" />
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
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link
          href={`/${storeSlug}`}
          className="hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/${storeSlug}/products`}
          className="hover:text-foreground transition-colors"
        >
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/${storeSlug}/products?category=${encodeURIComponent(product.category)}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <ProductImages images={product.images} />

        {/* Details */}
        <div className="space-y-6">
          {/* Category label */}
          {product.category && (
            <span className="text-xs font-medium uppercase tracking-widest text-primary/70">
              {product.category}
            </span>
          )}

          <h1 className="font-heading text-3xl md:text-4xl font-bold">
            {product.title}
          </h1>

          {/* Star rating */}
          {reviewData && reviewData.reviewCount > 0 && (
            <a href="#reviews" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <StarRating rating={reviewData.avgRating} />
              <span className="text-sm text-muted-foreground">
                {reviewData.avgRating.toFixed(1)} ({reviewData.reviewCount} reviews)
              </span>
            </a>
          )}

          <PriceDisplay
            price={price}
            compareAtPrice={compareAtPrice}
            size="lg"
          />

          <ViewersCount />

          <div className="prose prose-sm text-muted-foreground max-w-none leading-relaxed">
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
            <p className="text-sm text-destructive font-medium">
              Only {selectedVariant.stock} left in stock
            </p>
          )}

          <StockScarcityBar stock={selectedVariant.stock} />

          <div ref={addToCartRef}>
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

          {/* Free Shipping Progress Bar */}
          <FreeShippingBar />

          <BuyNowButton
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

          {/* Trust badges */}
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection storeSlug={storeSlug} productId={product.id} />

      {/* Frequently Bought Together */}
      <FrequentlyBoughtTogether
        storeSlug={storeSlug}
        productId={product.id}
        currentPrice={price}
      />

      {/* Related Products */}
      {related && related.length > 0 && (
        <section className="mt-20 pt-16 border-t">
          <div className="mb-10">
            <span className="text-sm font-medium uppercase tracking-widest text-primary/70 mb-2 block">
              You May Also Like
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold">
              Related Products
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
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

      {/* Sticky Mobile Add-to-Cart Bar */}
      {showStickyBar && selectedVariant.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-3 md:hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.title}</p>
              <p className="text-sm font-bold">{formatPrice(price)}</p>
            </div>
            <Button
              size="sm"
              className="rounded-full px-6 h-10 font-semibold shrink-0"
              onClick={() => {
                addItem({
                  variantId: selectedVariant.id,
                  productId: product.id,
                  productTitle: product.title,
                  variantName: selectedVariant.name,
                  price,
                  compareAtPrice,
                  quantity,
                  image: product.images[0]?.url || null,
                  stock: selectedVariant.stock,
                });
                if (store.config?.fbPixelId) {
                  trackAddToCart(product.id, product.title, price);
                }
              }}
            >
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Frequently Bought Together ──────────────────────────── */

function FrequentlyBoughtTogether({
  storeSlug,
  productId,
  currentPrice,
}: {
  storeSlug: string;
  productId: string;
  currentPrice: number;
}) {
  const { addItem } = useCart();
  const store = useStore();

  const { data: bundleProducts } =
    trpc.storefront.getFrequentlyBoughtTogether.useQuery(
      { storeSlug, productId, limit: 3 },
      { enabled: !!storeSlug && !!productId }
    );

  if (!bundleProducts || bundleProducts.length === 0) return null;

  const bundleTotal = bundleProducts.reduce((sum, sp) => {
    const v = sp.product.variants[0];
    if (!v) return sum;
    return sum + Number(sp.priceOverride ?? v.retailPrice);
  }, currentPrice);

  const handleAddAll = () => {
    for (const sp of bundleProducts) {
      const v = sp.product.variants[0];
      if (!v || v.stock <= 0) continue;
      addItem({
        variantId: v.id,
        productId: sp.product.id,
        productTitle: sp.product.title,
        variantName: v.name,
        price: Number(sp.priceOverride ?? v.retailPrice),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        quantity: 1,
        image: sp.product.images[0]?.url || null,
        stock: v.stock,
      });
      if (store.config?.fbPixelId) {
        trackAddToCart(
          sp.product.id,
          sp.product.title,
          Number(sp.priceOverride ?? v.retailPrice)
        );
      }
    }
  };

  return (
    <section className="mt-16 pt-12 border-t">
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-primary/70 mb-2 block">
          Complete Your Routine
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-bold">
          Frequently Bought Together
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
        {bundleProducts.map((sp) => (
          <ProductCard key={sp.id} storeProduct={sp} storeSlug={storeSlug} />
        ))}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-lg font-medium">
          Bundle Price: <span className="font-bold">{formatPrice(bundleTotal)}</span>
        </p>
        <Button
          size="lg"
          className="rounded-full px-8 font-semibold"
          onClick={handleAddAll}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Add All to Cart
        </Button>
      </div>
    </section>
  );
}
