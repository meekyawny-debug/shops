"use client";

import Link from "next/link";
import { Button } from "@shops/ui";
import { useStore } from "@/lib/store-context";

const storeHeroes: Record<
  string,
  { tagline: string; subtitle: string; gradient: string }
> = {
  glowhaven: {
    tagline: "Glow From Within",
    subtitle:
      "Discover clean beauty essentials that let your natural radiance shine through.",
    gradient: "from-pink-100 via-rose-50 to-white",
  },
  aurae: {
    tagline: "Timeless Elegance",
    subtitle:
      "Handcrafted fine jewelry designed for everyday luxury and lasting beauty.",
    gradient: "from-amber-50 via-yellow-50 to-white",
  },
  nestwell: {
    tagline: "Make It Home",
    subtitle:
      "Curated home decor that transforms your space into a warm, inviting sanctuary.",
    gradient: "from-orange-50 via-amber-50 to-white",
  },
};

export function HeroSection() {
  const store = useStore();
  const hero = storeHeroes[store.slug] || {
    tagline: `Welcome to ${store.name}`,
    subtitle: "Discover our curated collection.",
    gradient: "from-muted to-background",
  };

  return (
    <section className={`bg-gradient-to-b ${hero.gradient} py-20 md:py-32`}>
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6">
          {hero.tagline}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {hero.subtitle}
        </p>
        <Link href={`/${store.slug}/products`}>
          <Button size="lg" className="px-8">
            Shop Now
          </Button>
        </Link>
      </div>
    </section>
  );
}
