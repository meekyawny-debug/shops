"use client";

import { Flame, AlertTriangle } from "lucide-react";

export function StockScarcityBar({ stock }: { stock: number }) {
  if (stock <= 0 || stock > 50) return null;

  const pct = (stock / 50) * 100;
  const isAlmostGone = stock <= 10;
  const label = isAlmostGone ? "Almost Gone!" : "Selling Fast";
  const Icon = isAlmostGone ? AlertTriangle : Flame;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-sm font-medium text-destructive">
        <Icon className="h-4 w-4" />
        <span>{label} — Only {stock} left</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isAlmostGone
              ? "bg-destructive animate-pulse"
              : "bg-orange-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
