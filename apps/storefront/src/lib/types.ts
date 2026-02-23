import type { Decimal } from "@prisma/client/runtime/library";

export interface StoreConfig {
  id: string;
  storeId: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  metaTitle: string | null;
  metaDescription: string | null;
  socialInstagram: string | null;
  socialTiktok: string | null;
  socialFacebook: string | null;
  gaTrackingId: string | null;
  fbPixelId: string | null;
  customCss: string | null;
}

export interface StoreWithConfig {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  isActive: boolean;
  config: StoreConfig | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  options: unknown;
  costPrice: Decimal;
  retailPrice: Decimal;
  compareAtPrice: Decimal | null;
  stock: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string | null;
  tags: string[];
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface StoreProductWithDetails {
  id: string;
  storeId: string;
  productId: string;
  priceOverride: Decimal | null;
  isActive: boolean;
  isFeatured: boolean;
  position: number;
  product: Product;
}

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
