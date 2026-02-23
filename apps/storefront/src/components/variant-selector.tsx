"use client";

import { cn } from "@shops/ui";

interface Variant {
  id: string;
  name: string;
  stock: number;
}

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: Variant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (variants.length <= 1) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Options</label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onSelect(variant.id)}
            disabled={variant.stock <= 0}
            className={cn(
              "px-4 py-2 text-sm rounded-md border transition-colors",
              selectedId === variant.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:border-primary",
              variant.stock <= 0 && "opacity-50 cursor-not-allowed line-through"
            )}
          >
            {variant.name}
          </button>
        ))}
      </div>
    </div>
  );
}
