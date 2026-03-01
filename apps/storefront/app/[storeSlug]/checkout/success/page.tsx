"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@shops/ui";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { trackPurchase } from "@/lib/meta-pixel";
import { trpc } from "@/lib/trpc";
import { ProductCard } from "@/components/product-card";
import { UpsellOffer } from "@/components/upsell-offer";

type Phase = "upsell" | "confirmation";

const UPSELL_SESSION_KEY = "upsell-shown";

export default function CheckoutSuccessPage() {
  const params = useParams<{ storeSlug: string }>();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  const { clearCart, items } = useCart();
  const store = useStore();
  const [phase, setPhase] = useState<Phase>("upsell");
  const [pixelFired, setPixelFired] = useState(false);

  // Fetch order by Stripe session (for upsell data)
  const { data: order } = trpc.storefront.getOrderByStripeSession.useQuery(
    { stripeSessionId: sessionId! },
    { enabled: !!sessionId && !orderNumber }
  );

  // Get purchased product IDs for upsell exclusion
  const purchasedProductIds = order?.items.map((i) => (i as any).variant?.productId).filter(Boolean) as string[] ?? [];

  const { data: upsellProducts } = trpc.storefront.getUpsellProducts.useQuery(
    {
      storeSlug: params.storeSlug,
      purchasedProductIds,
      limit: 2,
    },
    {
      enabled: !!order && phase === "upsell",
    }
  );

  const acceptUpsell = trpc.storefront.acceptUpsell.useMutation();

  const { data: recommendations } =
    trpc.storefront.getBestSellingProducts.useQuery(
      { storeSlug: params.storeSlug, limit: 4 },
      { enabled: !!params.storeSlug && phase === "confirmation" }
    );

  // Determine if we should show upsell
  useEffect(() => {
    // Skip upsell for legacy (non-Stripe) checkout
    if (orderNumber && !sessionId) {
      setPhase("confirmation");
      return;
    }

    // Skip if already shown in this session
    try {
      if (sessionStorage.getItem(`${UPSELL_SESSION_KEY}-${sessionId}`)) {
        setPhase("confirmation");
        return;
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [orderNumber, sessionId]);

  // Fire Purchase pixel event and clear cart when entering confirmation phase
  useEffect(() => {
    if (phase !== "confirmation" || pixelFired) return;

    if (sessionId && items.length > 0) {
      if (store.config?.fbPixelId) {
        const total = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const variantIds = items.map((item) => item.variantId);
        const numItems = items.reduce((sum, item) => sum + item.quantity, 0);
        trackPurchase(variantIds, total, numItems, sessionId);
      }
      clearCart();
    }
    setPixelFired(true);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkipUpsell = useCallback(() => {
    // Mark as shown
    try {
      if (sessionId) {
        sessionStorage.setItem(`${UPSELL_SESSION_KEY}-${sessionId}`, "1");
      }
    } catch {
      // ignore
    }
    setPhase("confirmation");
  }, [sessionId]);

  const handleAcceptUpsell = useCallback(
    async (product: {
      variantId: string;
      discountedPrice: number;
    }) => {
      if (!order) return;

      await acceptUpsell.mutateAsync({
        storeSlug: params.storeSlug,
        parentOrderId: order.id,
        variantId: product.variantId,
        discountedPrice: product.discountedPrice,
        stripeCustomerId: order.customer?.stripeCustomerId ?? undefined,
      });
    },
    [order, params.storeSlug, acceptUpsell]
  );

  const displayOrderNumber = orderNumber || order?.orderNumber;

  // Phase 1: Upsell
  if (phase === "upsell" && sessionId) {
    // Wait for upsell data to load
    if (!upsellProducts) {
      // Still loading — show a subtle loading state
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-primary mb-6" />
          <h1 className="font-heading text-3xl font-bold mb-3">
            Payment Received!
          </h1>
          <p className="text-muted-foreground">
            Processing your order...
          </p>
        </div>
      );
    }

    // No upsell products available — skip to confirmation
    if (upsellProducts.length === 0) {
      handleSkipUpsell();
      return null;
    }

    return (
      <UpsellOffer
        products={upsellProducts}
        storeName={store.name}
        onAccept={handleAcceptUpsell}
        onSkip={handleSkipUpsell}
      />
    );
  }

  // Phase 2: Order Confirmation
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-lg mx-auto">
        <CheckCircle className="h-16 w-16 mx-auto text-primary mb-6" />
        <h1 className="font-heading text-3xl font-bold mb-3">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-2">
          Thank you for your order. We&apos;ll send you an email confirmation
          shortly.
        </p>
        {displayOrderNumber && (
          <p className="text-sm font-mono bg-muted rounded-lg px-4 py-3 mb-8 inline-block">
            Order #{displayOrderNumber}
          </p>
        )}
        {sessionId && !displayOrderNumber && (
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

      {recommendations && recommendations.length > 0 && (
        <div className="mt-16 max-w-5xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendations.map((sp) => (
              <ProductCard
                key={sp.id}
                storeProduct={sp}
                storeSlug={params.storeSlug}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
