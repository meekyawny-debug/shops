"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@shops/ui";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { trackAddToCart } from "@/lib/meta-pixel";
import type { CartItem } from "@/lib/types";

export function AddToCartButton({
  item,
  disabled,
}: {
  item: CartItem;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const store = useStore();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(item);
    if (store.config?.fbPixelId) {
      trackAddToCart(item.productId, item.productTitle, item.price);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleClick}
      disabled={disabled || item.stock <= 0}
    >
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added!
        </>
      ) : item.stock <= 0 ? (
        "Out of Stock"
      ) : (
        <>
          <ShoppingBag className="mr-2 h-5 w-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
