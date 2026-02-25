"use client";

import { Star } from "lucide-react";

export function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <div key={i} className="relative">
            <Star className={`${sizeClass} text-muted-foreground/30`} />
            {fill > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={`${sizeClass} fill-primary text-primary`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function InteractiveStarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 ${
              i < rating
                ? "fill-primary text-primary"
                : "text-muted-foreground/30 hover:text-primary/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
