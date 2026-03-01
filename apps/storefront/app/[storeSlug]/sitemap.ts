import type { MetadataRoute } from "next";
import { prisma } from "@shops/db";
import { getSiteUrl } from "@/lib/site-url";

export async function generateSitemaps() {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return stores.map((store) => ({ id: store.slug }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const storeSlug = id;

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    select: { id: true, updatedAt: true },
  });

  if (!store) return [];

  // Fetch all active products for this store
  const storeProducts = await prisma.storeProduct.findMany({
    where: {
      storeId: store.id,
      isActive: true,
      product: { isActive: true },
    },
    include: {
      product: { select: { id: true, updatedAt: true, category: true } },
    },
  });

  // Get unique categories
  const categories = [
    ...new Set(
      storeProducts
        .map((sp) => sp.product.category)
        .filter((c): c is string => c !== null)
    ),
  ];

  const staticPages = [
    { path: "", priority: 1.0 },
    { path: "/products", priority: 0.9 },
    { path: "/faq", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
    { path: "/shipping-returns", priority: 0.5 },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const page of staticPages) {
    entries.push({
      url: `${siteUrl}/${storeSlug}${page.path}`,
      lastModified: store.updatedAt,
      changeFrequency: page.priority > 0.8 ? "daily" : "weekly",
      priority: page.priority,
    });
  }

  // Collection pages
  for (const category of categories) {
    entries.push({
      url: `${siteUrl}/${storeSlug}/collections/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"))}`,
      lastModified: store.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Product pages
  for (const sp of storeProducts) {
    entries.push({
      url: `${siteUrl}/${storeSlug}/products/${sp.product.id}`,
      lastModified: sp.product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
