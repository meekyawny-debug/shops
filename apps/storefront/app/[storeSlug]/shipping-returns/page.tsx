import type { Metadata } from "next";
import { serverTrpc } from "@/lib/trpc-server";
import ShippingReturnsClient from "./shipping-returns-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;

  try {
    const store = await serverTrpc.storefront.getStore({ slug: storeSlug });
    return {
      title: `Shipping & Returns | ${store.name}`,
      description: `Learn about ${store.name} shipping times, return policy, and exchange process. Free shipping on orders over $40.`,
      alternates: {
        canonical: `/${storeSlug}/shipping-returns`,
      },
    };
  } catch {
    return { title: "Shipping & Returns" };
  }
}

export default function ShippingReturnsPage() {
  return <ShippingReturnsClient />;
}
