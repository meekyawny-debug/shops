"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { ProductCard } from "@/components/product-card";
import { HeroSection } from "@/components/hero-section";
import { CategoryCards } from "@/components/category-cards";
import { BrandStory } from "@/components/brand-story";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SocialProof } from "@/components/social-proof";
import { Truck, Shield, RotateCcw, AlertCircle } from "lucide-react";

export default function HomeClient() {
  const params = useParams<{ storeSlug: string }>();
  const storeSlug = params?.storeSlug;

  const { data: featured, isLoading, error } =
    trpc.storefront.getBestSellingProducts.useQuery(
      { storeSlug: storeSlug!, limit: 8 },
      { enabled: !!storeSlug }
    );

  const featuredProductIds = featured?.map((sp) => sp.productId) ?? [];
  const { data: ratings } = trpc.storefront.getProductsRatingsSummary.useQuery(
    { storeSlug: storeSlug!, productIds: featuredProductIds },
    { enabled: !!storeSlug && featuredProductIds.length > 0 }
  );

  if (!storeSlug) return null;

  return (
    <div>
      <HeroSection />

      <SocialProof />

      {/* Best Sellers */}
      <section id="products" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <span className="text-sm font-medium uppercase tracking-widest text-primary/70 mb-2 block">
                Trending Now
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">
                Best Sellers
              </h2>
            </div>
            <Link
              href={`/${storeSlug}/products`}
              className="text-sm font-medium text-primary hover:underline underline-offset-4 hidden sm:block"
            >
              View All &rarr;
            </Link>
          </div>
          {error ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8" />
              <p>Unable to load products. Please try again later.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3 animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-xl" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : featured && featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-10">
              {featured.map((sp) => (
                <ProductCard
                  key={sp.id}
                  storeProduct={sp}
                  storeSlug={storeSlug}
                  averageRating={ratings?.[sp.productId]?.avgRating}
                  reviewCount={ratings?.[sp.productId]?.reviewCount}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              New products coming soon!
            </p>
          )}
          <Link
            href={`/${storeSlug}/products`}
            className="text-sm font-medium text-primary hover:underline underline-offset-4 mt-8 block text-center sm:hidden"
          >
            View All &rarr;
          </Link>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:divide-x divide-border">
            <div className="flex-1 flex flex-col items-center text-center py-6 md:py-0 space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">
                On orders over $40
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center py-6 md:py-0 space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">
                Your data is protected
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center py-6 md:py-0 space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">
                30-day return policy
              </p>
            </div>
          </div>
        </div>
      </section>

      <CategoryCards />

      <BrandStory />

      <NewsletterSignup />
    </div>
  );
}
