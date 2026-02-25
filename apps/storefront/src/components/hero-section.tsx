"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    gradient: string;
  }
> = {
  glowhaven: {
    label: "Clean Beauty Essentials",
    tagline: "Bestselling Beauty\nUnder $35",
    subtitle:
      "Trending skincare & tools loved by 25,000+ customers. Free shipping on orders $40+.",
    primaryCta: "Shop Bestsellers",
    secondaryCta: "Shop Best Sellers",
    gradient: "from-rose-50 via-pink-50/50 to-background",
  },
  aurae: {
    label: "Handcrafted Fine Jewelry",
    tagline: "Timeless\nElegance",
    subtitle:
      "Handcrafted fine jewelry designed for everyday luxury and lasting beauty. Each piece tells your story.",
    primaryCta: "Explore Pieces",
    secondaryCta: "Shop Best Sellers",
    gradient: "from-amber-50 via-yellow-50/50 to-background",
  },
  nestwell: {
    label: "Curated Home Decor",
    tagline: "Make It\nHome",
    subtitle:
      "Curated home decor that transforms your space into a warm, inviting sanctuary. Beauty meets function.",
    primaryCta: "Shop Now",
    secondaryCta: "Shop Best Sellers",
    gradient: "from-emerald-50 via-teal-50/50 to-background",
  },
};

export function HeroSection() {
  const store = useStore();
  const hero = storeHeroes[store.slug] || {
    label: "Curated Collection",
    tagline: `Welcome to\n${store.name}`,
    subtitle: "Discover our curated collection of premium products.",
    primaryCta: "Shop Now",
    secondaryCta: "Shop Best Sellers",
    gradient: "from-secondary/50 to-background",
  };

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={`relative overflow-hidden md:min-h-[40vh] flex items-center bg-gradient-to-br ${hero.gradient}`}>
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-8 md:py-20">
        <div className="max-w-3xl">
          <span className="inline-block text-sm font-medium uppercase tracking-widest text-primary/70 mb-2 md:mb-4">
            {hero.label}
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-3 md:mb-6 whitespace-pre-line leading-[1.1]">
            {hero.tagline}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-6 md:mb-10 leading-relaxed line-clamp-1 sm:line-clamp-none">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="px-8 h-14 text-base font-semibold"
              onClick={scrollToProducts}
            >
              {hero.primaryCta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href={`/${store.slug}/products?sort=best-selling`}>
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-14 text-base font-semibold w-full sm:w-auto"
              >
                {hero.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
