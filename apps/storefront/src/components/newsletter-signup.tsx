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

  const subscribe = trpc.storefront.subscribeNewsletter.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
    },
  });

  const msg = storeMessages[store.slug] || {
    heading: "Stay in the Loop",
    sub: "Get the latest drops, exclusive offers, and style tips delivered to your inbox.",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ storeSlug: store.slug, email });
  };

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 text-center max-w-2xl space-y-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold">
          {msg.heading}
        </h2>
        <p className="text-muted-foreground">
          {msg.sub}
        </p>
        {submitted ? (
          <p className="text-sm font-medium text-primary pt-2">
            Thanks for subscribing! Check your inbox soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-w-md mx-auto pt-2">
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
        <p className="text-xs text-muted-foreground pt-1">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
