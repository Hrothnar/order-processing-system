import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { registry } from "./SchemaRegistry.js";
import { OrderStatus } from "@prisma/client";

extendZodWithOpenApi(z);

export const OrderItemsSchema = z.object({
    sku: z.string().nonempty(),
    quantity: z.number().positive(),
    unitPrise: z.number().positive()
});

export const ShippingAddressSchema = z.object({
    country: z.string().nonempty(),
    city: z.string().nonempty(),
    addressLine1: z.string().nonempty()
});

export const CreateOrderRequestSchema = z.object({
    customerId: z.uuid(),
    items: z.array(OrderItemsSchema),
    currency: z.string().min(3).max(3),
    shippingAddress: ShippingAddressSchema
}).openapi("CreateOrderRequest");

export const CreateOrderResponseSchema = z.object({
    orderId: z.uuid(),
    status: z.enum(OrderStatus),
    totalAmount: z.number(),
    currency: z.string(),
    createdAt: z.date()
}).openapi("CreateOrderResponse");

registry.registerPath({
    method: "post",
    path: "/api/external/v1/orders/create",
    summary: "Creates a new order with provided items",
    tags: ["Orders"],
    request: {
        body: {
            content: {
                "application/json": { schema: CreateOrderRequestSchema },
            },
        },
    },
    responses: {
        201: {
            description: "Created",
            content: {
                "application/json": { schema: CreateOrderResponseSchema },
            },
        },
    },
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;