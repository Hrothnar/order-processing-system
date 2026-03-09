import { Order, OrderItem, OutboxStatus } from "@prisma/client";
import { OrderItemsRequestSchema, ShippingAddressRequestSchema } from "../schema/ExternalSchemas";

export const IDEMPOTENCY_HEADER_NAME = "idempotency-key";

export interface OutboxInfo {
    eventId: string,
    aggregateType: string,
    aggregateId: string
    eventName: string
    eventVersion: number,
    payload: Record<string, any>,
    status: OutboxStatus
}

export interface IdempotencyInfo {
    key: string,
    requestHash: string,
    responseStatus: number,
    responseBody: Record<string, any>,
    resourceType: string,
    resourceId: string,
    expiresAt: Date
}

export interface OrderOutboxPayload {
    orderId: string,
    customerId: string,
    items: OrderItemsRequestSchema[],
    currency: string,
    totalAmount: number,
    address: ShippingAddressRequestSchema,
    createdAt: Date
}

export interface OrderWithItems extends Order {
    items: OrderItem[]
}