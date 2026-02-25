"use client";

import { formatPrice } from "@/lib/utils";

export function PriceDisplay({
  price,
  compareAtPrice,
  size = "default",
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "default" | "lg";
}) {
  const isOnSale = compareAtPrice && compareAtPrice > price;
  const discount = isOnSale
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const sizeClasses = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-3xl font-heading font-bold",
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={sizeClasses[size]}>{formatPrice(price)}</span>
      {isOnSale && (
        <>
          <span
            className={`${size === "sm" ? "text-xs" : "text-sm"} text-muted-foreground line-through`}
          >
            {formatPrice(compareAtPrice)}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
