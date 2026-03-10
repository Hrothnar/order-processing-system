import { Idempotency } from "@prisma/client";

import { DbClient, IdempotencyInfo } from "../type/Type.js";
import { prisma } from "../config/PrismaConfig.js";

export class IdempotencyRepository {

    async findRecord(idempotencyKey: string, db: DbClient = prisma): Promise<Idempotency> {
        const result = await db.idempotency.findUnique({ where: { key: idempotencyKey } });

        return result;
    }

    async createRecord(info: IdempotencyInfo, db: DbClient = prisma): Promise<Idempotency> {
        const result = db.idempotency.create({ data: info });

        return result;
    }


}

export const idempotencyRepository = new IdempotencyRepository();