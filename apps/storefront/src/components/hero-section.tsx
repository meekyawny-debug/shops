"use client";

import { Button } from "@shops/ui";
import { useStore } from "@/lib/store-context";

const storeHeroes: Record<
  string,
  {
    label: string;
    tagline: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  }
> = {
  glowhaven: {
    label: "Clean Beauty Essentials",
    tagline: "Bestselling Beauty\nUnder $35",
    subtitle:
      "Trending skincare & tools loved by 25,000+ customers. Free shipping on orders $40+.",
    primaryCta: "Shop Bestsellers",
    secondaryCta: "View All",
  },
  aurae: {
    label: "Handcrafted Fine Jewelry",
    tagline: "Timeless\nElegance",
    subtitle:
      "Handcrafted fine jewelry designed for everyday luxury and lasting beauty. Each piece tells your story.",
    primaryCta: "Explore Pieces",
    secondaryCta: "New Arrivals",
  },
  nestwell: {
    label: "Curated Home Decor",
    tagline: "Make It\nHome",
    subtitle:
      "Curated home decor that transforms your space into a warm, inviting sanctuary. Beauty meets function.",
    primaryCta: "Shop Now",
    secondaryCta: "View Collections",
  },
};

export function HeroSection() {
  const store = useStore();
  const hero = storeHeroes[store.slug] || {
    label: "Curated Collection",
    tagline: `Welcome to\n${store.name}`,
    subtitle: "Discover our curated collection of premium products.",
    primaryCta: "Shop Now",
    secondaryCta: "Browse All",
  };

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden md:min-h-[35vh] flex items-center">
      <div className="container mx-auto px-4 relative z-10 py-5 md:py-14">
        <div className="max-w-3xl">
          <span className="inline-block text-sm font-medium uppercase tracking-widest text-primary/70 mb-2 md:mb-4">
            {hero.label}
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2 md:mb-4 whitespace-pre-line leading-[1.1]">
            {hero.tagline}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-4 md:mb-8 leading-relaxed line-clamp-1 sm:line-clamp-none">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="px-8 h-12 text-base"
              onClick={scrollToProducts}
            >
              {hero.primaryCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
