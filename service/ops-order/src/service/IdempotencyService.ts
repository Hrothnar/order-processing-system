import { Idempotency, Order } from "@prisma/client";

import { idempotencyRepository } from "../repository/IdempotencyRepository.js";
import { DbClient, IdempotencyInfo } from "../type/Type.js";
import { CreateOrderRequest, CreateOrderResponse } from "../schema/ExternalSchemas.js";
import { hash } from "../util/Utility.js";

export class IdempotencyService {

    async findRecord(idempotencyKey: string, db?: DbClient): Promise<Idempotency> {
        const idempotencyRecord = await idempotencyRepository.findRecord(idempotencyKey, db);

        return idempotencyRecord;
    }

    async createRecord(idempotencyInfo: IdempotencyInfo, db?: DbClient): Promise<Idempotency> {
        const idempotencyRecord = await idempotencyRepository.createRecord(idempotencyInfo, db);

        return idempotencyRecord;
    }

    async createOrderRecord(idempotencyKey: string, input: CreateOrderRequest, order: Order, responseBody: CreateOrderResponse, db?: DbClient): Promise<Idempotency> {
        const idempotencyInfo: IdempotencyInfo = {
            key: idempotencyKey,
            requestHash: hash(input),
            resourceId: order.id,
            resourceType: "order",
            responseBody: responseBody,
            responseStatus: 201,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
        };

        const idempotencyRecord = await this.createRecord(idempotencyInfo, db);

        return idempotencyRecord;
    }


}

export const idempotencyService = new IdempotencyService();