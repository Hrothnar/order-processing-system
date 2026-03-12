import { Request, Response, NextFunction } from "express";

import { Order, OrderItem, OrderStatus, OutboxStatus, Prisma, PrismaClient } from "@prisma/client";

import { OrderItemsRequestSchema, ShippingAddressRequestSchema } from "../schema/ExternalSchemas.js";

export const IDEMPOTENCY_HEADER_NAME = "idempotency-key";

export type DbClient = PrismaClient | Prisma.TransactionClient;

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

export interface OrderReport {
    orderId: string,
    status: OrderStatus,
    failureReason: string
}

export interface OrderEvent {
    eventId: string,
    emitter: string
    createdAt: Date,
    payload: Record<string, any>
}

export interface EventEmit extends OrderEvent {
    payload: OrderOutboxPayload
}

export interface EventHandle extends OrderEvent {
    payload: OrderReport
}