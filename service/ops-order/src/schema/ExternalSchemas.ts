import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { OrderStatus, OrderItem } from "@prisma/client";

import { registry } from "./SchemaRegistry.js";
import { IDEMPOTENCY_HEADER_NAME } from "../type/Type.js";

extendZodWithOpenApi(z);

export const OrderItemsRequestSchema = z.object({
    sku: z.string().nonempty(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive()
});

export const ShippingAddressRequestSchema = z.object({
    country: z.string().nonempty(),
    city: z.string().nonempty(),
    addressLine1: z.string().nonempty()
});

export const CreateOrderRequestSchema = z.object({
    customerId: z.uuid(),
    items: z.array(OrderItemsRequestSchema),
    currency: z.string().min(3).max(3),
    shippingAddress: ShippingAddressRequestSchema
}).openapi("CreateOrderRequest");

export const CreateOrderResponseSchema = z.object({
    orderId: z.uuid(),
    status: z.enum(OrderStatus),
    totalAmount: z.number(),
    currency: z.string(),
    createdAt: z.date()
}).openapi("CreateOrderResponse");

export const CreateOrderHeaderRequestSchema = z.object({
    [IDEMPOTENCY_HEADER_NAME]: z.string().nonempty()
});

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
        headers: CreateOrderHeaderRequestSchema
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

export const GetOrderResponseSchema = z.object({
    status: z.enum(OrderStatus),
    items: z.array(OrderItemsRequestSchema),
    totalAmount: z.number(),
    failureReason: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const ListOrdersRequestQuerySchema = z.object({
    customerId: z.string().nonempty(),
    status: z.enum(OrderStatus).nullish(),
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;
export type OrderItemsRequestSchema = z.infer<typeof OrderItemsRequestSchema>;
export type ShippingAddressRequestSchema = z.infer<typeof ShippingAddressRequestSchema>;
export type GetOrderResponse = z.infer<typeof GetOrderResponseSchema>;

