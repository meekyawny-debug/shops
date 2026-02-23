"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { ProductCard } from "@/components/product-card";
import { HeroSection } from "@/components/hero-section";
import { CategoryCards } from "@/components/category-cards";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Truck, Shield, RotateCcw, AlertCircle } from "lucide-react";

export default function StoreHomePage() {
  const params = useParams<{ storeSlug: string }>();
  const storeSlug = params?.storeSlug;

  const { data: featured, isLoading, error } =
    trpc.storefront.getFeaturedProducts.useQuery(
      { storeSlug: storeSlug!, limit: 8 },
      { enabled: !!storeSlug }
    );

  if (!storeSlug) return null;

  return (
    <div>
      <HeroSection />

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-8">
            Featured Products
          </h2>
          {error ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8" />
              <p>Unable to load products. Please try again later.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3 animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : featured && featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featured.map((sp) => (
                <ProductCard
                  key={sp.id}
                  storeProduct={sp}
                  storeSlug={storeSlug}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              New products coming soon!
            </p>
          )}
        </div>
      </section>

      <CategoryCards />

      {/* Value Props */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <Truck className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">
                On orders over $75
              </p>
            </div>
            <div className="space-y-3">
              <Shield className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">
                Your data is protected
              </p>
            </div>
            <div className="space-y-3">
              <RotateCcw className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">
                30-day return policy
              </p>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSignup />
    </div>
  );
}
