import { z } from "zod";

export const createCustomerSchema = z.object({
  storeId: z.string().cuid(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
