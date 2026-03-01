import type { Metadata } from "next";
import { serverTrpc } from "@/lib/trpc-server";
import {
  JsonLd,
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/structured-data";
import { getSiteUrl } from "@/lib/site-url";
import ProductDetailClient from "./product-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; productId: string }>;
}): Promise<Metadata> {
  const { storeSlug, productId } = await params;

  try {
    const [storeProduct, store] = await Promise.all([
      serverTrpc.storefront.getProduct({ storeSlug, productId }),
      serverTrpc.storefront.getStore({ slug: storeSlug }),
    ]);

    const { product } = storeProduct;
    const description = product.description
      ? product.description.slice(0, 160)
      : `Shop ${product.title} at ${store.name}`;
    const imageUrl = product.images[0]?.url;
    const price = Number(
      storeProduct.priceOverride ?? product.variants[0]?.retailPrice ?? 0
    );

    return {
      title: `${product.title} | ${store.name}`,
      description,
      alternates: {
        canonical: `/${storeSlug}/products/${productId}`,
      },
      openGraph: {
        title: product.title,
        description,
        type: "website",
        ...(imageUrl && { images: [{ url: imageUrl }] }),
        url: `/${storeSlug}/products/${productId}`,
        siteName: store.name,
      },
      twitter: {
        card: "summary_large_image",
        title: product.title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
      other: {
        "product:price:amount": price.toFixed(2),
        "product:price:currency": "USD",
        ...(product.category && { "product:category": product.category }),
      },
    };
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ storeSlug: string; productId: string }>;
}) {
  const { storeSlug, productId } = await params;

  const siteUrl = getSiteUrl();

  try {
    const [storeProduct, store, reviewData] = await Promise.all([
      serverTrpc.storefront.getProduct({ storeSlug, productId }),
      serverTrpc.storefront.getStore({ slug: storeSlug }),
      serverTrpc.storefront.getProductReviews({
        storeSlug,
        productId,
        limit: 5,
      }),
    ]);

    const { product } = storeProduct;

    const productJsonLd = generateProductSchema(product, store, {
      avgRating: reviewData.avgRating,
      reviewCount: reviewData.reviewCount,
      reviews: reviewData.reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    });

    const breadcrumbJsonLd = generateBreadcrumbSchema([
      { name: store.name, url: `${siteUrl}/${storeSlug}` },
      { name: "Products", url: `${siteUrl}/${storeSlug}/products` },
      {
        name: product.title,
        url: `${siteUrl}/${storeSlug}/products/${productId}`,
      },
    ]);

    return (
      <>
        <JsonLd data={productJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <ProductDetailClient />
      </>
    );
  } catch {
    return <ProductDetailClient />;
  }
}
