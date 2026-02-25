"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { RecentPurchaseToast } from "./recent-purchase-toast";

export function RecentPurchaseToastWrapper() {
  const params = useParams<{ storeSlug: string }>();
  const storeSlug = params?.storeSlug;

  const { data: featured } = trpc.storefront.getFeaturedProducts.useQuery(
    { storeSlug: storeSlug!, limit: 8 },
    { enabled: !!storeSlug }
  );

  if (!featured || featured.length === 0) return null;

  return (
    <RecentPurchaseToast
      productTitles={featured.map((sp) => sp.product.title)}
    />
  );
}
