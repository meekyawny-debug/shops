"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Clock, Sparkles } from "lucide-react";
import { Button } from "@shops/ui";
import { useStore } from "@/lib/store-context";
import { trpc } from "@/lib/trpc";
import {
  wasExitIntentDismissed,
  wasExitIntentConverted,
  wasEmailPopupConverted,
  setExitIntentDismissed,
  setExitIntentConverted,
} from "@/lib/popup-utils";

const storeExitCodes: Record<string, { code: string; percent: number }> = {
  glowhaven: { code: "STAYGLOW15", percent: 15 },
  aurae: { code: "STAYAURAE15", percent: 15 },
  nestwell: { code: "STAYNEST15", percent: 15 },
};

const TIMER_DURATION = 15 * 60; // 15 minutes in seconds

export function ExitIntentPopup() {
  const store = useStore();
  const [show, setShow] = useState(false);
  const [armed, setArmed] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const scrollYRef = useRef(0);
  const scrollUpCountRef = useRef(0);

  const emailConverted = wasEmailPopupConverted(store.slug);
  const discount = storeExitCodes[store.slug] || { code: "STAY15", percent: 15 };

  const subscribe = trpc.storefront.subscribeNewsletter.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setExitIntentConverted(store.slug);
    },
    onError: () => {
      setError("Something went wrong. Please try again.");
    },
  });

  // Wait for email popup to resolve before arming
  useEffect(() => {
    if (wasExitIntentDismissed(store.slug) || wasExitIntentConverted(store.slug)) {
      return;
    }

    const handleResolved = () => setArmed(true);
    window.addEventListener("popup-email-resolved", handleResolved);

    // Fallback: arm after 20s regardless
    const fallback = setTimeout(() => setArmed(true), 20000);

    return () => {
      window.removeEventListener("popup-email-resolved", handleResolved);
      clearTimeout(fallback);
    };
  }, [store.slug]);

  // Desktop: detect mouse leaving viewport at top
  useEffect(() => {
    if (!armed || show) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [armed, show]);

  // Mobile: detect continuous scroll-up (300px)
  useEffect(() => {
    if (!armed || show) return;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < scrollYRef.current) {
        scrollUpCountRef.current += scrollYRef.current - currentY;
        if (scrollUpCountRef.current >= 300) {
          setShow(true);
        }
      } else {
        scrollUpCountRef.current = 0;
      }
      scrollYRef.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [armed, show]);

  // Countdown timer when shown
  useEffect(() => {
    if (!show || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show, submitted]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    setExitIntentDismissed(store.slug);
  }, [store.slug]);

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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

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
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="font-heading text-2xl font-bold text-center mb-2">
              Wait! Don&apos;t Miss Out
            </h2>
            <p className="text-center text-muted-foreground mb-4">
              Here&apos;s an exclusive {discount.percent}% off — just for you.
            </p>

            {/* Countdown timer */}
            {timeLeft > 0 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-bold text-primary">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                <span className="text-xs text-muted-foreground">left</span>
              </div>
            )}

            {/* Show email field only if user didn't already convert on email popup */}
            {!emailConverted ? (
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
                  {subscribe.isPending ? "Claiming..." : `Claim ${discount.percent}% Off`}
                </Button>
              </form>
            ) : (
              /* Already subscribed — just show the code */
              <div className="text-center">
                <p className="text-muted-foreground mb-3">
                  Use this code before it expires:
                </p>
                <div className="bg-muted rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-wider mb-4">
                  {discount.code}
                </div>
                <Button
                  className="w-full rounded-full h-12 font-semibold"
                  onClick={() => {
                    setExitIntentConverted(store.slug);
                    handleDismiss();
                  }}
                >
                  Continue Shopping
                </Button>
              </div>
            )}

            {!emailConverted && (
              <button
                onClick={handleDismiss}
                className="w-full text-center text-xs text-muted-foreground mt-3 hover:underline"
              >
                No thanks, I&apos;ll pass
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">
              It&apos;s Yours!
            </h2>
            <p className="text-muted-foreground mb-4">
              Use code <strong className="text-foreground">{discount.code}</strong> at
              checkout for {discount.percent}% off.
            </p>
            <div className="bg-muted rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-wider">
              {discount.code}
            </div>
            {timeLeft > 0 && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Expires in {minutes}m {seconds}s
              </p>
            )}
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
