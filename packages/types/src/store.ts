import { z } from "zod";

export const storeConfigSchema = z.object({
  logoUrl: z.string().url().nullable().optional(),
  faviconUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  fontHeading: z.string().default("Inter"),
  fontBody: z.string().default("Inter"),
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  socialInstagram: z.string().url().nullable().optional(),
  socialTiktok: z.string().url().nullable().optional(),
  socialFacebook: z.string().url().nullable().optional(),
  gaTrackingId: z.string().nullable().optional(),
  fbPixelId: z.string().nullable().optional(),
  customCss: z.string().nullable().optional(),
});

export const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  domain: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  config: storeConfigSchema.optional(),
});

export const updateStoreSchema = createStoreSchema.partial().extend({
  id: z.string().cuid(),
});

export type StoreConfig = z.infer<typeof storeConfigSchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
