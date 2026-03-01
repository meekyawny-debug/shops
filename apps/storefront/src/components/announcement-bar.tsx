"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store-context";

const storeMessages: Record<string, string> = {
  glowhaven: "FREE SHIPPING on orders $40+ \u2726 Clean Beauty, Delivered \u2726 10% off your first order: GLOW10",
  aurae: "FREE SHIPPING on orders $40+ \u2726 Handcrafted With Love \u2726 10% off your first order: AURAE10",
  nestwell: "FREE SHIPPING on orders $40+ \u2726 Elevate Your Space \u2726 10% off your first order: NEST10",
};

export function AnnouncementBar() {
  const store = useStore();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const message =
    storeMessages[store.slug] || "FREE SHIPPING on orders $40+";

  return (
    <div className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="py-2.5">
        {/* Marquee wrapper */}
        <div className="flex whitespace-nowrap animate-marquee">
          {/* Repeat message enough times to fill the marquee */}
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="text-sm font-medium tracking-wide mx-8">
              {message}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors z-10 bg-primary/80 backdrop-blur-sm rounded-full p-0.5"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
