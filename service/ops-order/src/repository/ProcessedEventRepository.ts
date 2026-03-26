import { ProcessedEvent } from "@prisma/client";

import { prisma } from "../config/PrismaConfig.js";
import { DbClient, EventHandle } from "../type/Type.js";
import { KAFKA_CONSUMER_NAME } from "../type/Env.js";

export class ProcessedEventRepository {

    async createRecord(report: EventHandle, db: DbClient = prisma): Promise<ProcessedEvent> {
        const result = await db.processedEvent.create({
            data: {
                eventId: report.eventId,
                consumerName: `${KAFKA_CONSUMER_NAME}:${report.emitter}`,
                processedAt: new Date()
            }
        });

        return result;
    }

}

export const processedEventRepository = new ProcessedEventRepository();