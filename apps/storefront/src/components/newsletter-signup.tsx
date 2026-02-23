"use client";

import { useState } from "react";
import { Button, Input } from "@shops/ui";
import { useStore } from "@/lib/store-context";

export function NewsletterSignup() {
  const store = useStore();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Store in localStorage for now
    try {
      const key = `newsletter-${store.slug}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ email, date: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}

    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
          Stay in the Loop
        </h2>
        <p className="text-muted-foreground mb-6">
          Get the latest drops, exclusive offers, and style tips delivered to
          your inbox.
        </p>
        {submitted ? (
          <p className="text-sm font-medium text-primary">
            Thanks for subscribing!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Subscribe</Button>
          </form>
        )}
      </div>
    </section>
  );
}
