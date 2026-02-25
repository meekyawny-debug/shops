import { Suspense } from "react";
import { notFound } from "next/navigation";
import { serverTrpc } from "@/lib/trpc-server";
import { generateStoreThemeVars } from "@/lib/theme";
import { getHeadingFont, inter } from "@/lib/fonts";
import { StoreProvider } from "@/lib/store-context";
import { CartProvider } from "@/lib/cart-context";
import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { MetaPixel } from "@/components/meta-pixel";
import { AuthSessionProvider } from "@/components/session-provider";
import { AuthModal } from "@/components/auth-modal";
import { RecentPurchaseToastWrapper } from "@/components/recent-purchase-toast-wrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  try {
    const store = await serverTrpc.storefront.getStore({ slug: storeSlug });
    return {
      title: store.config?.metaTitle || store.name,
      description:
        store.config?.metaDescription || `Shop at ${store.name}`,
    };
  } catch {
    return { title: "Store Not Found" };
  }
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;

  let store;
  try {
    store = await serverTrpc.storefront.getStore({ slug: storeSlug });
  } catch {
    notFound();
  }

  const config = store.config;
  const themeVars = config
    ? generateStoreThemeVars({
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor,
      })
    : {};

  const headingFont = config ? getHeadingFont(config.fontHeading) : inter;

  // Build CSS variables as inline style
  const cssVars: Record<string, string> = {
    ...themeVars,
  };

  return (
    <div
      className={headingFont.variable}
      style={cssVars as React.CSSProperties}
    >
      <AuthSessionProvider>
        <StoreProvider store={store}>
          <CartProvider storeSlug={storeSlug}>
            <Suspense fallback={null}>
              <MetaPixel />
            </Suspense>
            <AnnouncementBar />
            <StoreHeader />
            <main className="min-h-screen">{children}</main>
            <StoreFooter />
            <AuthModal />
            <RecentPurchaseToastWrapper />
          </CartProvider>
        </StoreProvider>
      </AuthSessionProvider>
    </div>
  );
}
