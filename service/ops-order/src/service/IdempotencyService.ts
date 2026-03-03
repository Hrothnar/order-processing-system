import { Idempotency, PrismaClient } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library";

import { prisma } from "../config/PrismaConfig.js";
import { idempotencyRepository } from "../repository/IdempotencyRepository.js";

export class IdempotencyService {

    async findRecord(idempotencyKey: string, client?: Omit<PrismaClient, ITXClientDenyList>): Promise<Idempotency> {
        return idempotencyRepository.findRecord(idempotencyKey, client);
    }

}

export const idempotencyService = new IdempotencyService();