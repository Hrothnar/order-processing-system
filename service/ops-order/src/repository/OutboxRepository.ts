import { Outbox, OutboxStatus } from "@prisma/client";

import { prisma } from "../config/PrismaConfig.js";
import { DbClient, OutboxInfo } from "../type/Type.js";
import * as ENV from "../type/Env.js";

export class OutboxRepository {

    async claimBatch(limit: number): Promise<Outbox[]> {

        const result = await prisma.$transaction(async (tx) => {
            const result = await tx.$queryRaw`
            WITH picked AS (
                    SELECT id
                    FROM outbox
                    WHERE status = 'PENDING'::"OutboxStatus"
                        AND (next_attempt_at IS NULL OR next_attempt_at <= now())
                    ORDER BY occurred_at ASC
                    FOR UPDATE SKIP LOCKED
                    LIMIT ${limit}
                )
            UPDATE outbox AS o
            SET status = 'PROCESSING'::"OutboxStatus",
                    locked_at = now(),
                    locked_by = ${ENV.OUTBOX_WORKER_NAME}
            FROM picked
            WHERE o.id = picked.id
            RETURNING *;
        `;

            return result;
        });

        return result as Outbox[];
    }

    async markAsPublished(id: number): Promise<void> {
        await prisma.$queryRaw`
            UPDATE outbox
            SET status = 'PUBLISHED'::"OutboxStatus",
                published_at = now(),
                locked_at = NULL,
                locked_by = NULL
            WHERE id = ${id};
        `;
    }

    async markForRetry(id: number): Promise<void> {
        await prisma.$queryRaw`
            UPDATE outbox
            SET status = CASE 
                    WHEN retry_count + 1 >= ${ENV.OUTBOX_WORKER_MAX_RETRIES} THEN 'FAILED'::"OutboxStatus"
                    ELSE 'PENDING'::"OutboxStatus" 
                END,
                next_attempt_at = CASE
                    WHEN retry_count + 1 >= ${ENV.OUTBOX_WORKER_MAX_RETRIES} THEN NULL
                    ELSE now() + (interval '1 second' * least(60, power(2, retry_count + 1)))
                END,
                retry_count = retry_count + 1,
                locked_at = NULL,
                locked_by = NULL
            WHERE id = ${id};
        `;
    }

    async recuperateExpiredLeases(): Promise<void> {
        await prisma.$queryRaw`
            UPDATE outbox
            SET status = 'PENDING'::"OutboxStatus",
                locked_at = NULL,
                locked_by = NULL
            WHERE status = 'PROCESSING'::"OutboxStatus"
                AND locked_at IS NOT NULL
                AND locked_at < now() - (interval '1 second' * ${ENV.OUTBOX_WORKER_LEASE_MIN * 60});
        `;
    }

    async createRecord(info: OutboxInfo, db: DbClient = prisma): Promise<Outbox> {
        const result = await db.outbox.create({ data: info });

        return result;
    }
}

export const outboxRepository = new OutboxRepository();