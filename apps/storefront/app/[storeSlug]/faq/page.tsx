import type { Metadata } from "next";
import { serverTrpc } from "@/lib/trpc-server";
import { JsonLd, generateFAQSchema } from "@/lib/structured-data";
import { storeFaqs } from "@/data/faqs";
import FaqClient from "./faq-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;

  try {
    const store = await serverTrpc.storefront.getStore({ slug: storeSlug });
    return {
      title: `FAQ | ${store.name}`,
      description: `Frequently asked questions about ${store.name}. Find answers about shipping, returns, products, and more.`,
      alternates: {
        canonical: `/${storeSlug}/faq`,
      },
    };
  } catch {
    return { title: "FAQ" };
  }
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;

  let faqs = storeFaqs.glowhaven!;
  try {
    const store = await serverTrpc.storefront.getStore({ slug: storeSlug });
    faqs = storeFaqs[store.slug] || faqs;
  } catch {
    // fallback to default faqs
  }

  return (
    <>
      <JsonLd data={generateFAQSchema(faqs)} />
      <FaqClient />
    </>
  );
}
