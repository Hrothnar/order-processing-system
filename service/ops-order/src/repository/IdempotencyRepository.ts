import { Idempotency, PrismaClient } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library";

import { prisma } from "../config/PrismaConfig.js";

export class IdempotencyRepository {

    async findRecord(idempotencyKey: string, client: Omit<PrismaClient, ITXClientDenyList> = prisma): Promise<Idempotency> {
        return client.idempotency.findUnique({ where: { key: idempotencyKey } });
    }


}

export const idempotencyRepository = new IdempotencyRepository();