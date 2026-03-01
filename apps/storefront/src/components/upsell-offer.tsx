"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, Check, Loader2 } from "lucide-react";
import { Button } from "@shops/ui";
import { formatPrice } from "@/lib/utils";

interface UpsellProduct {
  id: string;
  title: string;
  image: string | null;
  originalPrice: number;
  discountedPrice: number;
  variantId: string;
  variantName: string;
}

interface UpsellOfferProps {
  products: UpsellProduct[];
  storeName: string;
  onAccept: (product: UpsellProduct) => Promise<void>;
  onSkip: () => void;
}

const TIMER_DURATION = 10 * 60; // 10 minutes

export function UpsellOffer({
  products,
  storeName,
  onAccept,
  onSkip,
}: UpsellOfferProps) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onSkip]);

  const handleAccept = async (product: UpsellProduct) => {
    setError("");
    setAccepting(product.id);
    try {
      await onAccept(product);
      setAccepted(product.id);
      // Brief delay then proceed
      setTimeout(onSkip, 2000);
    } catch (err) {
      setError("Failed to add to your order. Please try again.");
      setAccepting(null);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
          Wait! A Special Offer Just For You
        </h1>
        <p className="text-muted-foreground">
          Complete your {storeName} experience with these hand-picked items at
          30% off — one-click to add to your order.
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Clock className="h-5 w-5 text-primary" />
        <span className="font-mono text-xl font-bold text-primary">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        <span className="text-sm text-muted-foreground">remaining</span>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-2xl overflow-hidden bg-background"
          >
            <div className="relative aspect-square bg-muted">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                30% OFF
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1 line-clamp-2">{product.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {product.variantName}
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.discountedPrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
              {accepted === product.id ? (
                <Button
                  className="w-full rounded-full"
                  disabled
                >
                  <Check className="h-4 w-4 mr-2" />
                  Added to Order
                </Button>
              ) : (
                <Button
                  className="w-full rounded-full font-semibold"
                  onClick={() => handleAccept(product)}
                  disabled={!!accepting || !!accepted}
                >
                  {accepting === product.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Order"
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center mb-4">{error}</p>
      )}

      {/* Skip link */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:underline"
          disabled={!!accepting}
        >
          No thanks, show my order confirmation &rarr;
        </button>
      </div>
    </div>
  );
}
