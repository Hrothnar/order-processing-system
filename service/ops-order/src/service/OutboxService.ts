import { randomUUID } from "node:crypto";

import { Order, Outbox, OutboxStatus, PrismaClient } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library.js";

import { outboxRepository } from "../repository/OutboxRepository.js";
import { prisma } from "../config/PrismaConfig.js";
import { OrderInfo, OutboxInfo, DbClient } from "../type/Type.js";
import { CreateOrderRequest } from "../schema/ExternalSchemas.js";

export class OutboxService {

    async claimBatch(limit: number): Promise<Outbox[]> {
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

    async createOrderRecord(input: CreateOrderRequest, order: Order, db?: DbClient): Promise<Outbox> {
        const outboxOrderPayload: OrderInfo = {
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

        const outboxRecord = await this.createRecord(outboxInfo, db);

        return outboxRecord;
    }
}

export const outboxService = new OutboxService();