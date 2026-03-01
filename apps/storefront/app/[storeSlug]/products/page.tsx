import type { Metadata } from "next";
import { serverTrpc } from "@/lib/trpc-server";
import { JsonLd, generateBreadcrumbSchema } from "@/lib/structured-data";
import { getSiteUrl } from "@/lib/site-url";
import ProductsClient from "./products-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;

  try {
    const store = await serverTrpc.storefront.getStore({ slug: storeSlug });
    return {
      title: `All Products | ${store.name}`,
      description: `Browse our full collection of curated products at ${store.name}. Find the best deals on trending items.`,
      alternates: {
        canonical: `/${storeSlug}/products`,
      },
    };
  } catch {
    return { title: "Products" };
  }
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;

  const siteUrl = getSiteUrl();

  let storeName = "Store";
  try {
    const store = await serverTrpc.storefront.getStore({ slug: storeSlug });
    storeName = store.name;
  } catch {
    // fallback
  }

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: storeName, url: `${siteUrl}/${storeSlug}` },
    { name: "Products", url: `${siteUrl}/${storeSlug}/products` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <ProductsClient />
    </>
  );
}
