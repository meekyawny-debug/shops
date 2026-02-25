"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store-context";

const storeMessages: Record<string, string> = {
  glowhaven: "FREE SHIPPING on orders $40+ | Clean Beauty, Delivered",
  aurae: "FREE SHIPPING on orders $40+ | Handcrafted With Love",
  nestwell: "FREE SHIPPING on orders $40+ | Elevate Your Space",
};

export function AnnouncementBar() {
  const store = useStore();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const message =
    storeMessages[store.slug] || "FREE SHIPPING on orders $40+";

  return (
    <div className="bg-primary text-primary-foreground relative">
      <div className="container mx-auto px-4 py-2 text-center text-sm font-medium tracking-wide">
        {message}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
