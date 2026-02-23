"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@shops/ui";
import { useCart } from "@/lib/cart-context";
import { QuantitySelector } from "@/components/quantity-selector";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const params = useParams<{ storeSlug: string }>();
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  const shippingCost = subtotal >= 75 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h1 className="font-heading text-2xl font-bold mb-3">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href={`/${params.storeSlug}/products`}>
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 p-4 border rounded-lg"
            >
              <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productTitle}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${params.storeSlug}/products/${item.productId}`}
                  className="font-medium hover:text-primary"
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
                    className="text-muted-foreground hover:text-destructive"
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
            <Button variant="outline" size="sm" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link href={`/${params.storeSlug}/products`}>
              <Button variant="ghost" size="sm">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-4 sticky top-24">
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
                    <span className="text-primary">Free</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (estimated)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {subtotal < 75 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(75 - subtotal)} more for free shipping
                </p>
              )}
            </div>
            <div className="border-t pt-4 flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href={`/${params.storeSlug}/checkout`}>
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
