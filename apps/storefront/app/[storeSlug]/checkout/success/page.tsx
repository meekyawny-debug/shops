"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@shops/ui";
import { useCart } from "@/lib/cart-context";

export default function CheckoutSuccessPage() {
  const params = useParams<{ storeSlug: string }>();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  const { clearCart, items } = useCart();

  // Clear cart on mount if arriving from Stripe checkout
  useEffect(() => {
    if (sessionId && items.length > 0) {
      clearCart();
    }
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <CheckCircle className="h-16 w-16 mx-auto text-primary mb-6" />
      <h1 className="font-heading text-3xl font-bold mb-3">
        Order Confirmed!
      </h1>
      <p className="text-muted-foreground mb-2">
        Thank you for your order. We&apos;ll send you an email confirmation
        shortly.
      </p>
      {orderNumber && (
        <p className="text-sm font-mono bg-muted rounded-lg px-4 py-3 mb-8 inline-block">
          Order #{orderNumber}
        </p>
      )}
      {sessionId && !orderNumber && (
        <p className="text-sm text-muted-foreground mb-8">
          Your payment has been processed successfully.
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/${params.storeSlug}/products`}>
          <Button>Continue Shopping</Button>
        </Link>
        <Link href={`/${params.storeSlug}`}>
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
