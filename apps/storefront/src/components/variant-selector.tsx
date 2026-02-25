"use client";

import { cn } from "@shops/ui";

interface Variant {
  id: string;
  name: string;
  stock: number;
}

const colorMap: Record<string, string> = {
  // Compound colors (checked first, before single-word matches)
  "rose gold": "bg-rose-300",
  "black pearl": "bg-gray-800",
  "olive green": "bg-green-700",
  "sage green": "bg-green-400",
  "blush pink": "bg-pink-300",
  "cream white": "bg-amber-50 border border-gray-200",
  "oat beige": "bg-amber-200",
  "matte black": "bg-black",
  // Extended single-word colors
  champagne: "bg-yellow-200",
  lavender: "bg-purple-300",
  mint: "bg-emerald-300",
  sage: "bg-green-400",
  olive: "bg-green-700",
  charcoal: "bg-gray-600",
  blush: "bg-pink-200",
  amber: "bg-amber-500",
  terracotta: "bg-orange-700",
  emerald: "bg-emerald-600",
  peach: "bg-orange-200",
  berry: "bg-rose-700",
  mauve: "bg-fuchsia-300",
  honey: "bg-amber-300",
  wood: "bg-amber-600",
  // Base colors
  black: "bg-black",
  white: "bg-white border border-gray-200",
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  pink: "bg-pink-400",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  brown: "bg-amber-700",
  grey: "bg-gray-400",
  gray: "bg-gray-400",
  navy: "bg-blue-900",
  beige: "bg-amber-100",
  cream: "bg-amber-50",
  gold: "bg-yellow-500",
  silver: "bg-gray-300",
  rose: "bg-rose-400",
  coral: "bg-orange-400",
  teal: "bg-teal-500",
  ivory: "bg-amber-50 border border-gray-200",
  nude: "bg-orange-200",
  natural: "bg-amber-200",
  clear: "bg-white border border-gray-200",
};

// Suffixes to strip before color matching
const suffixPatterns = [
  / - standard$/i,
  / \(\d+ stems?\)$/i,
  / \(\d+-piece\)$/i,
  / \(\d+ pack\)$/i,
  / pot$/i,
  / set$/i,
  / chain$/i,
  / tones?$/i,
  / kit$/i,
  / style$/i,
];

// Split colorMap into compound (multi-word) and single-word entries
const compoundColors: [string, string][] = [];
const singleColors: [string, string][] = [];
for (const [color, cls] of Object.entries(colorMap)) {
  if (color.includes(" ")) {
    compoundColors.push([color, cls]);
  } else {
    singleColors.push([color, cls]);
  }
}

function isColorVariant(name: string): string | null {
  // Strip known suffixes
  let cleaned = name.toLowerCase().trim();
  for (const pattern of suffixPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }
  cleaned = cleaned.trim();

  // 1. Exact match on full cleaned name
  if (colorMap[cleaned]) return colorMap[cleaned];

  // 2. Check compound (multi-word) colors first
  for (const [color, cls] of compoundColors) {
    if (cleaned.includes(color)) return cls;
  }

  // 3. Check single-word exact match (cleaned name IS a single color word)
  for (const [color, cls] of singleColors) {
    if (cleaned === color) return cls;
  }

  // 4. Check single-word substring match as fallback
  for (const [color, cls] of singleColors) {
    if (cleaned.includes(color)) return cls;
  }

  return null;
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

  // Only use color swatches when ALL variants resolve to a color AND all colors are unique
  const colorClasses = variants.map((v) => isColorVariant(v.name));
  const allMatch = colorClasses.every((c) => c !== null);
  const allUnique = allMatch && new Set(colorClasses).size === colorClasses.length;
  const hasColors = allMatch && allUnique;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        {hasColors ? "Color" : "Options"}
        {selectedId && (
          <span className="text-muted-foreground font-normal ml-2">
            — {variants.find((v) => v.id === selectedId)?.name}
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const colorClass = isColorVariant(variant.name);

          if (hasColors && colorClass) {
            // Circular color swatches
            return (
              <button
                key={variant.id}
                onClick={() => onSelect(variant.id)}
                disabled={variant.stock <= 0}
                className={cn(
                  "relative w-10 h-10 rounded-full transition-all",
                  selectedId === variant.id
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:ring-2 hover:ring-muted-foreground/30 hover:ring-offset-1",
                  variant.stock <= 0 && "opacity-40 cursor-not-allowed"
                )}
                title={variant.name}
              >
                <span className={cn("block w-full h-full rounded-full", colorClass)} />
                {/* Out of stock strikethrough */}
                {variant.stock <= 0 && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="block w-[140%] h-[1px] bg-gray-500 rotate-45 -translate-x-[1px]" />
                  </span>
                )}
              </button>
            );
          }

          // Non-color pill buttons
          return (
            <button
              key={variant.id}
              onClick={() => onSelect(variant.id)}
              disabled={variant.stock <= 0}
              className={cn(
                "px-5 py-2.5 text-sm rounded-full border transition-all",
                selectedId === variant.id
                  ? "bg-primary/10 border-primary text-foreground font-medium"
                  : "border-input hover:border-primary/50",
                variant.stock <= 0 && "opacity-40 cursor-not-allowed line-through"
              )}
            >
              {variant.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
