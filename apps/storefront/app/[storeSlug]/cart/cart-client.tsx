"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@shops/ui";
import { useCart } from "@/lib/cart-context";
import { QuantitySelector } from "@/components/quantity-selector";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 40;

export default function CartClient() {
  const params = useParams<{ storeSlug: string }>();
  const storeSlug = params?.storeSlug;
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;
  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const amountToFreeShipping = Math.max(
    FREE_SHIPPING_THRESHOLD - subtotal,
    0
  );

  if (!storeSlug) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-3">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href={`/${storeSlug}/products`}>
          <Button className="rounded-full px-8">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-10">Shopping Cart</h1>

      {/* Free shipping progress */}
      <div className="mb-8 p-4 bg-secondary/30 rounded-xl">
        {amountToFreeShipping > 0 ? (
          <p className="text-sm text-muted-foreground mb-2">
            Add <span className="font-medium text-foreground">{formatPrice(amountToFreeShipping)}</span> more
            for free shipping
          </p>
        ) : (
          <p className="text-sm text-primary font-medium mb-2">
            You qualify for free shipping!
          </p>
        )}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${shippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 p-4 bg-background border rounded-xl"
            >
              <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productTitle}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${storeSlug}/products/${item.productId}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {item.productTitle}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {item.variantName}
                </p>
                <p className="text-sm font-medium mt-1">
                  {formatPrice(item.price)}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <QuantitySelector
                    quantity={item.quantity}
                    maxStock={item.stock}
                    onChange={(qty) => updateQuantity(item.variantId, qty)}
                  />
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" size="sm" className="rounded-full" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link href={`/${storeSlug}/products`}>
              <Button variant="ghost" size="sm">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-secondary/30 rounded-xl p-6 space-y-4 sticky top-24">
            <h2 className="font-heading text-lg font-semibold">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-primary font-medium">Free</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (estimated)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href={`/${storeSlug}/checkout`}>
              <Button className="w-full rounded-full h-12 font-semibold" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
