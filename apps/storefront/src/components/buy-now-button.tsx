"use client";

import { useRouter, useParams } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@shops/ui";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { trackAddToCart } from "@/lib/meta-pixel";
import type { CartItem } from "@/lib/types";

export function BuyNowButton({
  item,
  disabled,
  size = "lg",
  className,
}: {
  item: CartItem;
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const { addItemSilent } = useCart();
  const store = useStore();
  const router = useRouter();
  const params = useParams<{ storeSlug: string }>();

  const handleClick = () => {
    addItemSilent(item);
    if (store.config?.fbPixelId) {
      trackAddToCart(item.productId, item.productTitle, item.price);
    }
    router.push(`/${params?.storeSlug}/checkout`);
  };

  return (
    <Button
      variant="outline"
      size={size}
      className={className ?? "w-full h-14 rounded-full font-semibold text-base active:scale-[0.98] transition-transform"}
      onClick={handleClick}
      disabled={disabled || item.stock <= 0}
    >
      {item.stock <= 0 ? (
        "Out of Stock"
      ) : (
        <>
          <Zap className="mr-2 h-5 w-5" />
          Buy Now
        </>
      )}
    </Button>
  );
}
