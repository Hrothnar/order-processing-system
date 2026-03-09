import { Idempotency, PrismaClient } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library";

import { prisma } from "../config/PrismaConfig.js";
import { IdempotencyInfo } from "../type/Type.js";

export class IdempotencyRepository {

    async findRecord(idempotencyKey: string, client: Omit<PrismaClient, ITXClientDenyList>): Promise<Idempotency> {
        return client.idempotency.findUnique({ where: { key: idempotencyKey } });
    }

    async createRecord(info: IdempotencyInfo, client: Omit<PrismaClient, ITXClientDenyList>): Promise<Idempotency> {
        const result = await client.idempotency.create({ data: info });
        return result;
    }


}

export const idempotencyRepository = new IdempotencyRepository();