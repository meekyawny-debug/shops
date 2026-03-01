"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@shops/ui";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export function CartSidebar() {
  const store = useStore();
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, subtotal } =
    useCart();

  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const amountToFreeShipping = Math.max(
    FREE_SHIPPING_THRESHOLD - subtotal,
    0
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-heading text-lg font-semibold">
            Cart ({items.length})
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setCartOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Free Shipping Progress */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-b">
            {amountToFreeShipping > 0 ? (
              <p className="text-xs text-muted-foreground mb-2">
                Add <span className="font-medium text-foreground">{formatPrice(amountToFreeShipping)}</span> more
                for free shipping
              </p>
            ) : (
              <p className="text-xs text-primary font-medium mb-2">
                You qualify for free shipping!
              </p>
            )}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Your cart is empty</p>
              <Link
                href={`/${store.slug}/products`}
                onClick={() => setCartOpen(false)}
              >
                <Button variant="outline" className="rounded-full">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {item.productTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.variantName}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock}
                      className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
            <div className="flex flex-col gap-2">
              <Link href={`/${store.slug}/checkout`} onClick={() => setCartOpen(false)}>
                <Button className="w-full rounded-full h-12 font-semibold">
                  Checkout
                </Button>
              </Link>
              <Link href={`/${store.slug}/cart`} onClick={() => setCartOpen(false)}>
                <Button variant="outline" className="w-full rounded-full h-12">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
