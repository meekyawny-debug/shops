"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button, Input, Label } from "@shops/ui";
import { useCart } from "@/lib/cart-context";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const params = useParams<{ storeSlug: string }>();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const shippingCost = subtotal >= 75 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    shippingAddress1: "",
    shippingAddress2: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "US",
  });

  const createOrder = trpc.storefront.createOrder.useMutation({
    onSuccess: (order) => {
      clearCart();
      router.push(
        `/${params.storeSlug}/checkout/success?orderNumber=${order.orderNumber}`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate({
      storeSlug: params.storeSlug,
      ...form,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">
          No items in cart
        </h1>
        <p className="text-muted-foreground mb-6">
          Add some products before checking out.
        </p>
        <Link href={`/${params.storeSlug}/products`}>
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact */}
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="address1">Address</Label>
                <Input
                  id="address1"
                  required
                  value={form.shippingAddress1}
                  onChange={(e) =>
                    updateField("shippingAddress1", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address2">
                  Apartment, suite, etc. (optional)
                </Label>
                <Input
                  id="address2"
                  value={form.shippingAddress2}
                  onChange={(e) =>
                    updateField("shippingAddress2", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  required
                  value={form.shippingCity}
                  onChange={(e) =>
                    updateField("shippingCity", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  required
                  value={form.shippingState}
                  onChange={(e) =>
                    updateField("shippingState", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  required
                  value={form.shippingZip}
                  onChange={(e) =>
                    updateField("shippingZip", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.shippingCountry}
                  onChange={(e) =>
                    updateField("shippingCountry", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Payment note */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Payment processing coming soon. Orders will be created with
              PENDING status for now.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-4 sticky top-24">
            <h2 className="font-heading text-lg font-semibold">
              Order Summary
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0 rounded bg-muted overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        -
                      </div>
                    )}
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.productTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.variantName}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
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
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "Placing Order..." : "Place Order"}
            </Button>
            {createOrder.error && (
              <p className="text-sm text-destructive">
                {createOrder.error.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
