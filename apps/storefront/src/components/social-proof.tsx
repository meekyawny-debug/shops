"use client";

import { Users, Star, MessageSquare, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store-context";

const storeStats: Record<
  string,
  { customers: string; rating: string; reviews: string }
> = {
  glowhaven: { customers: "25K+", rating: "4.9", reviews: "3,200+" },
  aurae: { customers: "18K+", rating: "4.8", reviews: "2,400+" },
  nestwell: { customers: "30K+", rating: "4.9", reviews: "4,100+" },
};

export function SocialProof() {
  const store = useStore();
  const stats = storeStats[store.slug] || {
    customers: "20K+",
    rating: "4.9",
    reviews: "2,500+",
  };

  const items = [
    {
      icon: Users,
      value: stats.customers,
      label: "Happy Customers",
    },
    {
      icon: Star,
      value: stats.rating,
      label: "Average Rating",
    },
    {
      icon: MessageSquare,
      value: stats.reviews,
      label: "Verified Reviews",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Secure Checkout",
    },
  ];

  return (
    <section className="bg-secondary/50 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.label} className="text-center space-y-2">
              <item.icon className="h-6 w-6 mx-auto text-primary/70" />
              <p className="font-heading text-2xl md:text-3xl font-bold">
                {item.value}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
