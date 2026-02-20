import { z } from "zod";

export const supplierTypeEnum = z.enum([
  "CJ_DROPSHIPPING",
  "ALIEXPRESS",
  "MANUAL",
]);

export const productVariantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  options: z.record(z.string()).default({}),
  costPrice: z.number().min(0),
  retailPrice: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  weight: z.number().min(0).nullable().optional(),
  supplierVariantId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().nullable().optional(),
  position: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  supplierType: supplierTypeEnum,
  supplierProductId: z.string().nullable().optional(),
  supplierUrl: z.string().url().nullable().optional(),
  baseCost: z.number().min(0),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  variants: z.array(productVariantSchema).min(1),
  images: z.array(productImageSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid(),
});

export const assignToStoreSchema = z.object({
  productId: z.string().cuid(),
  storeId: z.string().cuid(),
  priceOverride: z.number().min(0).nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
});

export type SupplierType = z.infer<typeof supplierTypeEnum>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AssignToStoreInput = z.infer<typeof assignToStoreSchema>;
