import type { Metadata } from "next";
import { serverTrpc } from "@/lib/trpc-server";
import ContactClient from "./contact-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;

  try {
    const store = await serverTrpc.storefront.getStore({ slug: storeSlug });
    return {
      title: `Contact Us | ${store.name}`,
      description: `Get in touch with ${store.name}. We're here to help with orders, returns, and any questions you may have.`,
      alternates: {
        canonical: `/${storeSlug}/contact`,
      },
    };
  } catch {
    return { title: "Contact Us" };
  }
}

export default function ContactPage() {
  return <ContactClient />;
}
