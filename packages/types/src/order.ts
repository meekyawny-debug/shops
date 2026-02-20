import { z } from "zod";

export const orderStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const shippingAddressSchema = z.object({
  name: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().nullable().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(2).max(2),
});

export const orderItemSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  unitCost: z.number().min(0),
  productTitle: z.string(),
  variantName: z.string(),
});

export const createOrderSchema = z.object({
  storeId: z.string().cuid(),
  customerId: z.string().cuid(),
  items: z.array(orderItemSchema).min(1),
  shipping: shippingAddressSchema,
  shippingCost: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  notes: z.string().nullable().optional(),
});

export const updateOrderSchema = z.object({
  id: z.string().cuid(),
  status: orderStatusEnum.optional(),
  trackingNumber: z.string().nullable().optional(),
  trackingUrl: z.string().url().nullable().optional(),
  supplierOrderId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type OrderStatus = z.infer<typeof orderStatusEnum>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
