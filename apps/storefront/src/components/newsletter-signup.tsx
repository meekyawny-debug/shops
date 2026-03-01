"use client";

import { useState } from "react";
import { Button, Input } from "@shops/ui";
import { useStore } from "@/lib/store-context";
import { trpc } from "@/lib/trpc";

const storeMessages: Record<string, { heading: string; sub: string }> = {
  glowhaven: {
    heading: "Join the Glow Community",
    sub: "Get exclusive beauty tips, early access to new drops, and 10% off your first order.",
  },
  aurae: {
    heading: "Be the First to Know",
    sub: "Get exclusive previews of new collections, styling guides, and 10% off your first order.",
  },
  nestwell: {
    heading: "Stay Inspired",
    sub: "Receive decor ideas, exclusive launches, and 10% off your first order.",
  },
};

export function NewsletterSignup() {
  const store = useStore();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = trpc.storefront.subscribeNewsletter.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError(null);
      setEmail("");
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  const msg = storeMessages[store.slug] || {
    heading: "Stay in the Loop",
    sub: "Get the latest drops, exclusive offers, and style tips delivered to your inbox.",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    subscribe.mutate({ storeSlug: store.slug, email });
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary/5" />
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center bg-background/80 backdrop-blur-sm rounded-3xl border border-border/50 px-6 py-12 md:px-12 md:py-16 shadow-sm">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            {msg.heading}
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            {msg.sub}
          </p>
          {submitted ? (
            <p className="text-sm font-medium text-primary pt-2">
              Thanks for subscribing! Check your inbox soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-l-full rounded-r-none border-r-0 h-12 px-5"
              />
              <Button
                type="submit"
                className="rounded-l-none rounded-r-full h-12 px-6"
                disabled={subscribe.isPending}
              >
                {subscribe.isPending ? "..." : "Subscribe"}
              </Button>
            </form>
          )}
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
