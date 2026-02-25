"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, X } from "lucide-react";

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Miami",
  "Austin", "Denver", "Seattle", "Nashville", "Portland",
  "San Diego", "Boston", "Atlanta", "Charlotte", "Dallas",
];

export function RecentPurchaseToast({
  productTitles,
}: {
  productTitles: string[];
}) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({ city: "", product: "" });

  const showToast = useCallback(() => {
    if (productTitles.length === 0) return;
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const product =
      productTitles[Math.floor(Math.random() * productTitles.length)];
    setCurrent({ city, product });
    setVisible(true);

    // Auto-dismiss after 5s
    setTimeout(() => setVisible(false), 5000);
  }, [productTitles]);

  useEffect(() => {
    if (productTitles.length === 0) return;

    // First toast after 10s
    const initial = setTimeout(showToast, 10000);

    // Then every 30-45s
    const schedule = () => {
      const delay = 30000 + Math.random() * 15000;
      return setTimeout(() => {
        showToast();
        timerId = schedule();
      }, delay);
    };

    let timerId = schedule();
    return () => {
      clearTimeout(initial);
      clearTimeout(timerId);
    };
  }, [productTitles, showToast]);

  if (!visible || productTitles.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-background border rounded-xl shadow-lg p-4 flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ShoppingBag className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">
            Someone in {current.city}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            just bought {current.product}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            a few moments ago
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
