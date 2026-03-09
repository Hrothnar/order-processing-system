import { Idempotency, Order, PrismaClient } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library";

import { prisma } from "../config/PrismaConfig.js";
import { idempotencyRepository } from "../repository/IdempotencyRepository.js";
import { IdempotencyInfo } from "../type/Type.js";
import { CreateOrderRequest, CreateOrderResponse } from "../schema/ExternalSchemas.js";
import { hash } from "../util/Utility.js";

export class IdempotencyService {

    async findRecord(idempotencyKey: string, client?: Omit<PrismaClient, ITXClientDenyList>): Promise<Idempotency> {
        return idempotencyRepository.findRecord(idempotencyKey, client);
    }

    async createRecord(idempotencyInfo: IdempotencyInfo, client?: Omit<PrismaClient, ITXClientDenyList>): Promise<Idempotency> {
        return idempotencyRepository.createRecord(idempotencyInfo, client);
    }

    async createOrderRecord(idempotencyKey: string, input: CreateOrderRequest, order: Order, responseBody: CreateOrderResponse, client?: Omit<PrismaClient, ITXClientDenyList>): Promise<Idempotency> {
        const idempotencyInfo: IdempotencyInfo = {
            key: idempotencyKey,
            requestHash: hash(input),
            resourceId: order.id,
            resourceType: "order",
            responseBody: responseBody,
            responseStatus: 201,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
        };

        return this.createRecord(idempotencyInfo, client);
    }


}

export const idempotencyService = new IdempotencyService();