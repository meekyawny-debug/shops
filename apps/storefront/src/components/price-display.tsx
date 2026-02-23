"use client";

import { formatPrice } from "@/lib/utils";
import { Badge } from "@shops/ui";

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
    lg: "text-2xl font-bold",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={sizeClasses[size]}>{formatPrice(price)}</span>
      {isOnSale && (
        <>
          <span
            className={`${size === "sm" ? "text-xs" : "text-sm"} text-muted-foreground line-through`}
          >
            {formatPrice(compareAtPrice)}
          </span>
          <Badge variant="secondary" className="text-xs">
            -{discount}%
          </Badge>
        </>
      )}
    </div>
  );
}
