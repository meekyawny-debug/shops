"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button, Input, Label } from "@shops/ui";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Truck, RotateCcw, CreditCard, Tag, X } from "lucide-react";
import {
  generateEventId,
  trackInitiateCheckout,
  trackPurchase,
} from "@/lib/meta-pixel";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;
const PHONE_RE = /^[\d\s()+-]{7,20}$/;

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  shippingAddress1?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
}

function validateForm(form: Record<string, string>): FormErrors {
  const errors: FormErrors = {};

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(form.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";

  if (form.phone && !PHONE_RE.test(form.phone)) {
    errors.phone = "Please enter a valid phone number";
  }

  if (!form.shippingAddress1.trim()) errors.shippingAddress1 = "Address is required";
  if (!form.shippingCity.trim()) errors.shippingCity = "City is required";
  if (!form.shippingState.trim()) errors.shippingState = "State is required";

  if (!form.shippingZip.trim()) {
    errors.shippingZip = "ZIP code is required";
  } else if (!ZIP_RE.test(form.shippingZip)) {
    errors.shippingZip = "Please enter a valid ZIP code";
  }

  return errors;
}

export default function CheckoutClient() {
  const params = useParams<{ storeSlug: string }>();
  const storeSlug = params?.storeSlug;
  const router = useRouter();
  const store = useStore();
  const { items, subtotal, clearCart } = useCart();
  const trpcUtils = trpc.useUtils();
  const fbEventIdRef = useRef<string>("");

  // Fire InitiateCheckout on mount
  useEffect(() => {
    if (!store.config?.fbPixelId || items.length === 0) return;
    trackInitiateCheckout(
      items.map((i) => i.variantId),
      subtotal,
      items.reduce((n, i) => n + i.quantity, 0)
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponDiscountType, setCouponDiscountType] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const isFreeShipping = couponDiscountType === "FREE_SHIPPING";
  const shippingCost = isFreeShipping ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = (subtotal - couponDiscount) * TAX_RATE;
  const total = subtotal - couponDiscount + shippingCost + tax;

  // Stripe checkout session
  const createCheckoutSession = trpc.storefront.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  // Legacy order creation (fallback when Stripe not configured)
  const createOrder = trpc.storefront.createOrder.useMutation({
    onSuccess: (order) => {
      if (store.config?.fbPixelId && fbEventIdRef.current) {
        trackPurchase(
          items.map((i) => i.variantId),
          Number(order.total),
          items.reduce((n, i) => n + i.quantity, 0),
          fbEventIdRef.current
        );
      }
      clearCart();
      router.push(
        `/${storeSlug}/checkout/success?orderNumber=${order.orderNumber}`
      );
    },
  });

  const handleStripeCheckout = () => {
    if (!storeSlug) return;
    const origin = window.location.origin;
    createCheckoutSession.mutate({
      storeSlug,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        productTitle: item.productTitle,
        variantName: item.variantName,
        price: item.price,
        image: item.image,
      })),
      successUrl: `${origin}/${storeSlug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/${storeSlug}/checkout`,
      ...(couponApplied && { couponCode: couponApplied }),
    });
  };

  const handleLegacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const eventId = generateEventId();
    fbEventIdRef.current = eventId;

    createOrder.mutate({
      storeSlug: storeSlug!,
      ...form,
      fbEventId: eventId,
      ...(couponApplied && { couponCode: couponApplied }),
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (submitted) {
      const newForm = { ...form, [field]: value };
      const newErrors = validateForm(newForm);
      setErrors((prev) => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }));
    }
  };

  if (!storeSlug) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">
          No items in cart
        </h1>
        <p className="text-muted-foreground mb-6">
          Add some products before checking out.
        </p>
        <Link href={`/${storeSlug}/products`}>
          <Button className="rounded-full px-8">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const isPending = createCheckoutSession.isPending || createOrder.isPending;
  const checkoutError = createCheckoutSession.error || createOrder.error;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: Checkout options */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stripe Checkout (primary) */}
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Secure Checkout
            </h2>
            <p className="text-sm text-muted-foreground">
              Pay securely with credit card, debit card, or other payment methods via Stripe.
              Shipping address will be collected on the next page.
            </p>

            {/* Coupon Code */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError("");
                  }}
                  className="max-w-xs"
                  disabled={!!couponApplied}
                />
                {couponApplied ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCouponApplied(null);
                      setCouponCode("");
                      setCouponDiscount(0);
                      setCouponDiscountType(null);
                      setCouponError("");
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!couponCode.trim() || !storeSlug) return;
                      setCouponError("");
                      try {
                        const result = await trpcUtils.storefront.validateCoupon.fetch({
                          storeSlug,
                          code: couponCode.trim(),
                          orderSubtotal: subtotal,
                        });
                        if (result.valid) {
                          setCouponApplied(result.code);
                          setCouponDiscount(result.discountAmount);
                          setCouponDiscountType(result.discountType);
                        } else {
                          setCouponError(result.error);
                        }
                      } catch {
                        setCouponError("Unable to validate coupon.");
                      }
                    }}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </Button>
                )}
              </div>
            </div>
            {couponError && (
              <p className="text-sm text-destructive">{couponError}</p>
            )}
            {couponApplied && (
              <p className="text-sm text-primary">
                Coupon &ldquo;{couponApplied}&rdquo; applied
                {couponDiscountType === "FREE_SHIPPING"
                  ? " — Free shipping!"
                  : couponDiscount > 0
                    ? ` — You save ${formatPrice(couponDiscount)}`
                    : ""}
              </p>
            )}

            <Button
              size="lg"
              className="w-full rounded-full h-14 font-semibold text-base"
              onClick={handleStripeCheckout}
              disabled={isPending}
            >
              {createCheckoutSession.isPending
                ? "Redirecting to Stripe..."
                : "Pay with Stripe"}
            </Button>

            {createCheckoutSession.error && (
              <p className="text-sm text-destructive">
                {createCheckoutSession.error.message}
              </p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or pay without card
              </span>
            </div>
          </div>

          {/* Legacy form (fallback) */}
          <form onSubmit={handleLegacySubmit} noValidate className="space-y-8">
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
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-semibold">
                Shipping Address
              </h2>
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                Currently shipping to US addresses only.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="address1">Address</Label>
                  <Input
                    id="address1"
                    value={form.shippingAddress1}
                    onChange={(e) =>
                      updateField("shippingAddress1", e.target.value)
                    }
                    className={errors.shippingAddress1 ? "border-destructive" : ""}
                  />
                  {errors.shippingAddress1 && (
                    <p className="text-xs text-destructive mt-1">{errors.shippingAddress1}</p>
                  )}
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
                    value={form.shippingCity}
                    onChange={(e) =>
                      updateField("shippingCity", e.target.value)
                    }
                    className={errors.shippingCity ? "border-destructive" : ""}
                  />
                  {errors.shippingCity && (
                    <p className="text-xs text-destructive mt-1">{errors.shippingCity}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.shippingState}
                    onChange={(e) =>
                      updateField("shippingState", e.target.value)
                    }
                    className={errors.shippingState ? "border-destructive" : ""}
                  />
                  {errors.shippingState && (
                    <p className="text-xs text-destructive mt-1">{errors.shippingState}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={form.shippingZip}
                    onChange={(e) =>
                      updateField("shippingZip", e.target.value)
                    }
                    className={errors.shippingZip ? "border-destructive" : ""}
                  />
                  {errors.shippingZip && (
                    <p className="text-xs text-destructive mt-1">{errors.shippingZip}</p>
                  )}
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

            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-full h-12 font-semibold"
              disabled={isPending}
            >
              {createOrder.isPending ? "Placing Order..." : "Place Order (No Card)"}
            </Button>
            {createOrder.error && (
              <p className="text-sm text-destructive">
                {createOrder.error.message}
              </p>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-secondary/30 rounded-xl p-6 space-y-4 sticky top-24">
            <h2 className="font-heading text-lg font-semibold">
              Order Summary
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
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
              {couponDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount ({couponApplied})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
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
                <span>Tax (est.)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                Free Shipping ${FREE_SHIPPING_THRESHOLD}+
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5" />
                30-Day Returns
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
