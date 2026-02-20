import { z } from "zod";

export const supplierProductSchema = z.object({
  supplierProductId: z.string(),
  title: z.string(),
  description: z.string(),
  images: z.array(
    z.object({
      url: z.string().url(),
      alt: z.string().optional(),
    })
  ),
  variants: z.array(
    z.object({
      supplierVariantId: z.string(),
      name: z.string(),
      options: z.record(z.string()),
      costPrice: z.number().min(0),
      stock: z.number().int().min(0),
      weight: z.number().min(0).optional(),
    })
  ),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  supplierUrl: z.string().url().optional(),
});

export const shippingOptionSchema = z.object({
  name: z.string(),
  cost: z.number().min(0),
  estimatedDays: z.number().int().min(1),
  trackable: z.boolean(),
});

export const supplierOrderResultSchema = z.object({
  supplierOrderId: z.string(),
  status: z.string(),
});

export const trackingInfoSchema = z.object({
  trackingNumber: z.string(),
  carrier: z.string(),
  trackingUrl: z.string().url().optional(),
  status: z.string(),
  events: z.array(
    z.object({
      date: z.string(),
      location: z.string().optional(),
      description: z.string(),
    })
  ),
});

export type SupplierProduct = z.infer<typeof supplierProductSchema>;
export type ShippingOption = z.infer<typeof shippingOptionSchema>;
export type SupplierOrderResult = z.infer<typeof supplierOrderResultSchema>;
export type TrackingInfo = z.infer<typeof trackingInfoSchema>;
