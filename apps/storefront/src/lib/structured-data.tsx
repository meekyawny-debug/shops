import type { StoreWithConfig } from "./types";
import { getSiteUrl } from "./site-url";

// JSON-LD component for injecting structured data
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function generateOrganizationSchema(store: StoreWithConfig) {
  const siteUrl = getSiteUrl();
  const sameAs: string[] = [];
  if (store.config?.socialInstagram) sameAs.push(store.config.socialInstagram);
  if (store.config?.socialTiktok) sameAs.push(store.config.socialTiktok);
  if (store.config?.socialFacebook) sameAs.push(store.config.socialFacebook);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: store.name,
    url: `${siteUrl}/${store.slug}`,
    ...(store.config?.logoUrl && { logo: store.config.logoUrl }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function generateWebSiteSchema(store: StoreWithConfig) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: store.name,
    url: `${siteUrl}/${store.slug}`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/${store.slug}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateProductSchema(
  product: {
    title: string;
    description: string;
    images: { url: string }[];
    category?: string | null;
    variants: {
      retailPrice: unknown;
      compareAtPrice?: unknown;
      stock: number;
      sku: string;
    }[];
  },
  store: StoreWithConfig,
  reviewData?: {
    avgRating: number;
    reviewCount: number;
    reviews?: {
      rating: number;
      title: string;
      body: string;
      authorName: string;
      createdAt: string | Date;
    }[];
  }
) {
  const siteUrl = getSiteUrl();
  const prices = product.variants.map((v) => Number(v.retailPrice));
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);
  const inStock = product.variants.some((v) => v.stock > 0);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description.slice(0, 5000),
    ...(product.images.length > 0 && {
      image: product.images.map((img) => img.url),
    }),
    ...(product.category && { category: product.category }),
    brand: {
      "@type": "Brand",
      name: store.name,
    },
    sku: product.variants[0]?.sku,
    offers: {
      "@type": prices.length > 1 ? "AggregateOffer" : "Offer",
      priceCurrency: "USD",
      ...(prices.length > 1
        ? { lowPrice: lowPrice.toFixed(2), highPrice: highPrice.toFixed(2) }
        : { price: lowPrice.toFixed(2) }),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/${store.slug}/products/${product.variants[0]?.sku}`,
      seller: {
        "@type": "Organization",
        name: store.name,
      },
    },
  };

  if (reviewData && reviewData.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewData.avgRating.toFixed(1),
      reviewCount: reviewData.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };

    if (reviewData.reviews && reviewData.reviews.length > 0) {
      schema.review = reviewData.reviews.slice(0, 5).map((r) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: "5",
          worstRating: "1",
        },
        name: r.title,
        reviewBody: r.body,
        author: {
          "@type": "Person",
          name: r.authorName,
        },
        datePublished: new Date(r.createdAt).toISOString().split("T")[0],
      }));
    }
  }

  return schema;
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}
