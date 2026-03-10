import { Outbox } from "@prisma/client";

import { prisma } from "../config/PrismaConfig.js";
import { DbClient, OutboxInfo } from "../type/Type.js";
import * as ENV from "../type/Env.js";

export class OutboxRepository {

    async claimBatch(limit: number): Promise<any> {
        const result = await prisma.$transaction(async (tx) => {
            const result = await tx.$executeRaw`
            WITH picked AS (
                    SELECT id
                    FROM outbox
                    WHERE status = 'PENDING' 
                        AND (nextAttemptAt IS NULL OR nextAttemptAt <= now())
                    ORDER BY occurredAt ASC
                    FOR UPDATE SKIP LOCKED
                    LIMIT ${limit}
                )
            UPDATE outbox AS o
            SET status = 'PROCESSING',
                    lockedAt = now(),
                    lockedBy = ${ENV.OUTBOX_WORKER_NAME}
            FROM picked
            WHERE o.id = picked.id
            RETURNING;
            `;

            return result;
        });

        console.log(result);

        return result;
    }

    async markAsPublished(id: number): Promise<void> {
        await prisma.$queryRaw`
            UPDATE outbox
            SET status = 'PUBLISHED',
                publishedAt = now(),
                lockedAt = NULL,
                lockedBy = NULL
            WHERE id = ${id};
        `;
    }

    async markForRetry(id: number): Promise<void> {
        await prisma.$queryRaw`
            UPDATE outbox
            SET status = CASE 
                    WHEN retryCount + 1 >= ${ENV.OUTBOX_WORKER_MAX_RETRIES} THEN 'FAILED' 
                    ELSE 'PENDING' 
                END,
                nextAttemptAt = CASE
                    WHEN retryCount + 1 >= ${ENV.OUTBOX_WORKER_MAX_RETRIES} THEN NULL
                    ELSE now() + (interval '1 second' * least(60, power(2, retryCount + 1)))
                END,
                retryCount = retryCount + 1,
                lockedAt = NULL,
                lockedBy = NULL
            WHERE id = ${id};        
            `;
    }

    async recuperateExpiredLeases(): Promise<void> {
        await prisma.$queryRaw`
            UPDATE outbox
            SET status = 'PENDING',
                lockedAt = NULL,
                lockedBy = NULL
            WHERE status = 'PROCESSING'
                AND lockedAt IS NOT NULL
                AND lockedAt < now() - (interval '1 second' * ${ENV.OUTBOX_WORKER_LEASE_MIN * 60});
        `;
    }

    async createRecord(info: OutboxInfo, db: DbClient = prisma): Promise<Outbox> {
        const result = await db.outbox.create({ data: info });

        return result;
    }
}

export const outboxRepository = new OutboxRepository();