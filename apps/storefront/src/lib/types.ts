import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@shops/api";

type RouterOutput = inferRouterOutputs<AppRouter>;

// Inferred types from the tRPC router — always in sync with the API
export type StoreWithConfig = RouterOutput["storefront"]["getStore"];
export type StoreProductWithDetails = RouterOutput["storefront"]["getProduct"];
export type FeaturedStoreProduct = RouterOutput["storefront"]["getFeaturedProducts"][number];
export type ProductsResponse = RouterOutput["storefront"]["getProducts"];

export interface CartItem {
  variantId: string;
  productId: string;
  productTitle: string;
  variantName: string;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  image: string | null;
  stock: number;
}
