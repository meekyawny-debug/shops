"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
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
    heroImage: string;
    imageAlt: string;
    proofText: string;
  }
> = {
  glowhaven: {
    label: "Clean Beauty Essentials",
    tagline: "Bestselling Beauty\nUnder $35",
    subtitle:
      "Trending skincare & tools loved by 25,000+ customers. Free shipping on orders $40+.",
    primaryCta: "Shop Bestsellers",
    secondaryCta: "New Arrivals",
    heroImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=80&auto=format&fit=crop",
    imageAlt: "Beauty skincare products flatlay",
    proofText: "Loved by 25K+ customers",
  },
  aurae: {
    label: "Handcrafted Fine Jewelry",
    tagline: "Timeless\nElegance",
    subtitle:
      "Handcrafted fine jewelry designed for everyday luxury and lasting beauty. Each piece tells your story.",
    primaryCta: "Explore Pieces",
    secondaryCta: "Gift Ideas",
    heroImage: "https://images.unsplash.com/photo-1515562141589-67f0d932b7f6?w=1400&q=80&auto=format&fit=crop",
    imageAlt: "Gold jewelry on elegant display",
    proofText: "Trusted by 18K+ customers",
  },
  nestwell: {
    label: "Curated Home Decor",
    tagline: "Make It\nHome",
    subtitle:
      "Curated home decor that transforms your space into a warm, inviting sanctuary. Beauty meets function.",
    primaryCta: "Shop Now",
    secondaryCta: "Trending Now",
    heroImage: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80&auto=format&fit=crop",
    imageAlt: "Cozy living room with warm lighting",
    proofText: "Loved by 30K+ homeowners",
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
    heroImage: "",
    imageAlt: "",
    proofText: "Trusted by thousands",
  };

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center">
      {/* Background image */}
      {hero.heroImage && (
        <Image
          src={hero.heroImage}
          alt={hero.imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-24">
        <div className="max-w-2xl">
          {/* Social proof badge */}
          <div className="animate-fade-in-up mb-4 md:mb-6">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {hero.proofText}
            </span>
          </div>

          <span className="animate-fade-in-up inline-block text-sm font-medium uppercase tracking-widest text-white/70 mb-2 md:mb-4">
            {hero.label}
          </span>
          <h1 className="animate-fade-in-up-delay font-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-3 md:mb-6 whitespace-pre-line leading-[1.1] text-white">
            {hero.tagline}
          </h1>
          <p className="animate-fade-in-up-delay-2 text-lg md:text-xl text-white/80 max-w-xl mb-6 md:mb-10 leading-relaxed line-clamp-2 sm:line-clamp-none">
            {hero.subtitle}
          </p>
          <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="px-8 h-14 text-base font-semibold transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
              onClick={scrollToProducts}
            >
              {hero.primaryCta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href={`/${store.slug}/products?sort=best-selling`}>
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-14 text-base font-semibold w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
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
