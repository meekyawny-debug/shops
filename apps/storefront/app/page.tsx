import Link from "next/link";
import { serverTrpc } from "@/lib/trpc-server";

const storeDescriptions: Record<string, { tagline: string; color: string }> = {
  glowhaven: {
    tagline: "Clean beauty essentials for your natural glow",
    color: "from-pink-100 to-pink-50",
  },
  aurae: {
    tagline: "Handcrafted fine jewelry for everyday luxury",
    color: "from-amber-100 to-amber-50",
  },
  nestwell: {
    tagline: "Curated home decor for warm, inviting spaces",
    color: "from-orange-100 to-orange-50",
  },
};

export default async function StoreDirectoryPage() {
  let stores: { id: string; name: string; slug: string; config: { metaDescription: string | null } | null }[] = [];
  try {
    const result = await serverTrpc.store.list();
    stores = result.filter((s) => s.isActive);
  } catch {
    // If protected, fall back to storefront queries
    const slugs = ["glowhaven", "aurae", "nestwell"];
    const results = await Promise.allSettled(
      slugs.map((slug) => serverTrpc.storefront.getStore({ slug }))
    );
    stores = results
      .filter(
        (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled"
      )
      .map((r) => r.value);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Our Stores
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of stores, each with its own unique
            style and carefully selected products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stores.map((store) => {
            const info = storeDescriptions[store.slug] || {
              tagline: store.config?.metaDescription || "Shop now",
              color: "from-gray-100 to-gray-50",
            };
            return (
              <Link
                key={store.id}
                href={`/${store.slug}`}
                className="group block"
              >
                <div
                  className={`bg-gradient-to-b ${info.color} rounded-2xl p-8 text-center transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1`}
                >
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {store.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {info.tagline}
                  </p>
                  <span className="inline-block text-sm font-medium text-primary border border-primary/20 rounded-full px-4 py-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Visit Store
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
