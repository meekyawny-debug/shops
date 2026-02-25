"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Flame, AlertTriangle } from "lucide-react";
import { Button } from "@shops/ui";
import { PriceDisplay } from "./price-display";
import { StarRating } from "./star-rating";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { trackAddToCart } from "@/lib/meta-pixel";
import type { FeaturedStoreProduct } from "@/lib/types";

export function ProductCard({
  storeProduct,
  storeSlug,
  averageRating,
  reviewCount,
}: {
  storeProduct: FeaturedStoreProduct;
  storeSlug: string;
  averageRating?: number;
  reviewCount?: number;
}) {
  const { product } = storeProduct;
  const firstImage = product.images[0];
  const secondImage = product.images[1];
  const firstVariant = product.variants[0];
  const { addItemSilent } = useCart();
  const store = useStore();
  const router = useRouter();

  if (!firstVariant) return null;

  const price = Number(
    storeProduct.priceOverride ?? firstVariant.retailPrice
  );
  const compareAtPrice = firstVariant.compareAtPrice
    ? Number(firstVariant.compareAtPrice)
    : null;

  const isOnSale = compareAtPrice && compareAtPrice > price;
  const discount = isOnSale
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const isSingleVariant = product.variants.length === 1;
  const productHref = `/${storeSlug}/products/${product.id}`;

  // Scarcity: check total stock across all variants
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isLowStock = totalStock > 0 && totalStock <= 10;
  const isFeatured = storeProduct.isFeatured;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItemSilent({
      variantId: firstVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantName: firstVariant.name,
      price,
      compareAtPrice,
      quantity: 1,
      image: firstImage?.url || null,
      stock: firstVariant.stock,
    });
    if (store.config?.fbPixelId) {
      trackAddToCart(product.id, product.title, price);
    }
    router.push(`/${storeSlug}/checkout`);
  };

  return (
    <div className="group">
      <Link href={productHref} className="block">
        <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-muted mb-3">
          {firstImage ? (
            <>
              <Image
                src={firstImage.url}
                alt={firstImage.alt || product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {secondImage && (
                <Image
                  src={secondImage.url}
                  alt={secondImage.alt || product.title}
                  fill
                  className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOnSale && (
              <span className="bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse">
                -{discount}%
              </span>
            )}
            {isLowStock && (
              <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Low Stock
              </span>
            )}
            {isFeatured && !isLowStock && (
              <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Trending
              </span>
            )}
          </div>
        </div>

        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {product.category}
          </p>
        )}

        <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {product.title}
        </h3>
        <PriceDisplay price={price} compareAtPrice={compareAtPrice} size="sm" />
        {averageRating != null && averageRating > 0 && reviewCount != null && reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        )}
      </Link>

      <div className="mt-2">
        {isSingleVariant ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-9 rounded-full font-medium"
            onClick={handleBuyNow}
            disabled={firstVariant.stock <= 0}
          >
            {firstVariant.stock <= 0 ? (
              "Out of Stock"
            ) : (
              <>
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Buy Now
              </>
            )}
          </Button>
        ) : (
          <Link href={productHref}>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-9 rounded-full font-medium"
            >
              Select Options
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
