"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@shops/ui";

export function QuantitySelector({
  quantity,
  maxStock,
  onChange,
}: {
  quantity: number;
  maxStock: number;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="inline-flex items-center border rounded-full">
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-full"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-12 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-full"
        onClick={() => onChange(Math.min(maxStock, quantity + 1))}
        disabled={quantity >= maxStock}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
