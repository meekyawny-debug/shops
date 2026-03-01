"use client";

import { useState, useEffect, useRef } from "react";
import { X, Gift } from "lucide-react";
import { Button } from "@shops/ui";
import { useStore } from "@/lib/store-context";
import { trpc } from "@/lib/trpc";
import {
  wasEmailPopupDismissed,
  wasEmailPopupConverted,
  setEmailPopupDismissed,
  setEmailPopupConverted,
  dispatchPopupEvent,
} from "@/lib/popup-utils";

const storeDiscountCodes: Record<string, { code: string; percent: number }> = {
  glowhaven: { code: "GLOW10", percent: 10 },
  aurae: { code: "AURAE10", percent: 10 },
  nestwell: { code: "NEST10", percent: 10 },
};

const storeMessages: Record<string, { headline: string; subtext: string }> = {
  glowhaven: {
    headline: "Unlock Your Glow",
    subtext: "Get 10% off your first order of clean beauty essentials.",
  },
  aurae: {
    headline: "Shine Brighter",
    subtext: "Get 10% off your first jewelry order. Timeless pieces await.",
  },
  nestwell: {
    headline: "Welcome Home",
    subtext: "Get 10% off your first order of cozy home decor.",
  },
};

export function EmailCapturePopup() {
  const store = useStore();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const handledRef = useRef(false);

  const discount = storeDiscountCodes[store.slug] || { code: "WELCOME10", percent: 10 };
  const message = storeMessages[store.slug] || {
    headline: "Welcome!",
    subtext: `Get ${discount.percent}% off your first order.`,
  };

  const subscribe = trpc.storefront.subscribeNewsletter.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setEmailPopupConverted(store.slug);
      dispatchPopupEvent("popup-email-resolved");
    },
    onError: () => {
      setError("Something went wrong. Please try again.");
    },
  });

  useEffect(() => {
    if (handledRef.current) return;

    if (wasEmailPopupDismissed(store.slug) || wasEmailPopupConverted(store.slug)) {
      handledRef.current = true;
      setTimeout(() => dispatchPopupEvent("popup-email-resolved"), 100);
      return;
    }

    const timer = setTimeout(() => {
      if (!handledRef.current) {
        setShow(true);
        handledRef.current = true;
      }
    }, 7000);
    return () => clearTimeout(timer);
  }, [store.slug]);

  const handleDismiss = () => {
    setShow(false);
    handledRef.current = true;
    setEmailPopupDismissed(store.slug);
    dispatchPopupEvent("popup-email-resolved");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    subscribe.mutate({ storeSlug: store.slug, email: email.trim() });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="font-heading text-2xl font-bold text-center mb-2">
              {message.headline}
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              {message.subtext}
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full rounded-full h-12 font-semibold"
                disabled={subscribe.isPending}
              >
                {subscribe.isPending ? "Subscribing..." : `Get ${discount.percent}% Off`}
              </Button>
            </form>
            <button
              onClick={handleDismiss}
              className="w-full text-center text-xs text-muted-foreground mt-3 hover:underline"
            >
              No thanks, I&apos;ll pay full price
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">
              You&apos;re In!
            </h2>
            <p className="text-muted-foreground mb-4">
              Use code <strong className="text-foreground">{discount.code}</strong> at
              checkout for {discount.percent}% off.
            </p>
            <div className="bg-muted rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-wider">
              {discount.code}
            </div>
            <Button
              className="w-full rounded-full h-12 font-semibold mt-4"
              onClick={handleDismiss}
            >
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
