import { randomUUID } from "node:crypto";

import { Order, Outbox, OutboxStatus, PrismaClient } from "@prisma/client";

import { outboxRepository } from "../repository/OutboxRepository.js";
import { ITXClientDenyList } from "@prisma/client/runtime/library.js";
import { prisma } from "../config/PrismaConfig.js";
import { OrderOutboxPayload as OutboxOrderPayload, OutboxInfo } from "../type/Type.js";
import { CreateOrderRequest } from "../schema/ExternalSchemas.js";

export class OutboxService {

    async claimBatch(limit: number): Promise<any> {
        return outboxRepository.claimBatch(limit);
    }

    async markAsPublished(id: number): Promise<void> {
        return outboxRepository.markAsPublished(id);
    }

    async markForRetry(id: number): Promise<void> {
        return outboxRepository.markForRetry(id);
    }

    async recuperateExpiredLeases(): Promise<void> {
        return outboxRepository.recuperateExpiredLeases();
    }

    async createRecord(info: OutboxInfo, client: Omit<PrismaClient, ITXClientDenyList> = prisma): Promise<Outbox> {
        return outboxRepository.createRecord(info, client);
    }

    async createOrderRecord(input: CreateOrderRequest, order: Order, client: Omit<PrismaClient, ITXClientDenyList> = prisma): Promise<Outbox> {
        const outboxOrderPayload: OutboxOrderPayload = {
            orderId: order.id,
            customerId: order.customerId,
            items: input.items,
            currency: order.currency,
            totalAmount: order.totalAmount.toNumber(),
            address: input.shippingAddress,
            createdAt: order.createdAt
        };

        const outboxInfo: OutboxInfo = {
            aggregateId: order.id,
            aggregateType: "order",
            eventId: randomUUID(),
            eventName: "OrderCreated",
            eventVersion: 1,
            payload: outboxOrderPayload,
            status: OutboxStatus.PENDING
        };

        return this.createRecord(outboxInfo, client);
    }
}

export const outboxService = new OutboxService();