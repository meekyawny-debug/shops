"use client";

import { Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 40;

export function FreeShippingBar() {
  const { subtotal } = useCart();
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
      <Truck className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        {amountToFreeShipping > 0 ? (
          <p className="text-xs text-muted-foreground">
            Add{" "}
            <span className="font-medium text-foreground">
              {formatPrice(amountToFreeShipping)}
            </span>{" "}
            more for <span className="font-medium text-primary">FREE shipping</span>
          </p>
        ) : (
          <p className="text-xs text-primary font-medium">
            You qualify for free shipping!
          </p>
        )}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
