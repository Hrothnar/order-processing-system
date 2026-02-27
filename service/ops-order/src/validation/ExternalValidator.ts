import { z } from "zod";

export const orderItemsSchema = z.object({
    sku: z.string(),
    quantity: z.number(),
    unitPrise: z.number()
});

export const shippingAddressSchema = z.object({
    country: z.string(),
    city: z.string(),
    addressLine1: z.string()
});

export const createOrderSchema = z.object({
    customerId: z.uuid(),
    items: z.array(orderItemsSchema),
    currency: z.string(),
    shippingAddress: shippingAddressSchema
});

export type VCreateOrder = z.infer<typeof createOrderSchema>;