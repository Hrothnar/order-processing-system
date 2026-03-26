import { Request, Response, NextFunction } from "express";

export const IDEMPOTENCY_HEADER_NAME = "idempotency-key";

export interface Cool {
    isItCool: boolean
}

export enum OrderStatus {
    PENDING = "PENDING",
    PAYMENT_AUTHORIZED = "PAYMENT_AUTHORIZED",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    INVENTORY_RESERVED = "INVENTORY_RESERVED",
    INVENTORY_REJECTED = "INVENTORY_REJECTED",
    FULFILLMENT_REQUESTED = "FULFILLMENT_REQUESTED",
    FULFILLED = "FULFILLED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

export interface OrderItemsRequest {
    sku: string,
    quantity: number,
    unitPrice: number
}

export interface ShippingAddressRequest {
    country: string,
    city: string,
    addressLine1: string
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
    items: OrderItemsRequest[],
    currency: string,
    totalAmount: number,
    address: ShippingAddressRequest,
    createdAt: Date
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
    payload: OrderReport
}

export interface EventHandle extends OrderEvent {
    payload: OrderOutboxPayload
}