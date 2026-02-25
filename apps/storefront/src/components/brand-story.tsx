"use client";

import { Sparkles, Gem, Home } from "lucide-react";
import { useStore } from "@/lib/store-context";

const storeBrands: Record<
  string,
  {
    icon: typeof Sparkles;
    headline: string;
    description: string;
    values: string[];
  }
> = {
  glowhaven: {
    icon: Sparkles,
    headline: "Beauty That Feels Good",
    description:
      "At Glowhaven, we believe everyone deserves access to clean, effective beauty products. Our curated collection is free from harsh chemicals and crafted with ingredients you can trust. From skincare essentials to finishing touches, every product is chosen to help you glow naturally.",
    values: ["Clean Ingredients", "Cruelty-Free", "Dermatologist Tested", "Eco-Packaging"],
  },
  aurae: {
    icon: Gem,
    headline: "Crafted for Everyday Elegance",
    description:
      "Aurae was born from a love of timeless design and meaningful craftsmanship. Each piece in our collection is handcrafted by skilled artisans using ethically sourced materials. We believe jewelry should tell a story — yours.",
    values: ["Handcrafted", "Ethically Sourced", "Tarnish-Resistant", "Lifetime Warranty"],
  },
  nestwell: {
    icon: Home,
    headline: "Where House Meets Home",
    description:
      "Nestwell curates home decor that balances beauty with function. We partner with independent makers and sustainable brands to bring you pieces that transform any space into a warm, inviting sanctuary. Because home should feel like a hug.",
    values: ["Sustainable", "Artisan Made", "Functional Design", "Curated Quality"],
  },
};

export function BrandStory() {
  const store = useStore();
  const brand = storeBrands[store.slug] || storeBrands.glowhaven;
  const Icon = brand.icon;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-balance">
          {brand.headline}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-balance">
          {brand.description}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {brand.values.map((value) => (
            <span
              key={value}
              className="px-4 py-1.5 text-sm border border-primary/20 rounded-full text-foreground/80"
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
