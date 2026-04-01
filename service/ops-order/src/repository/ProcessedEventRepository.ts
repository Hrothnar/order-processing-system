import { prisma } from "../config/PrismaConfig.js";
import { DbClient, EventHandle } from "../type/Type.js";
import { KAFKA_CONSUMER_NAME } from "../type/Env.js";

export class ProcessedEventRepository {

    async createRecord(report: EventHandle, db: DbClient = prisma): Promise<boolean> {
        try {
            await db.processedEvent.create({
                data: {
                    eventId: report.eventId,
                    consumerName: `${KAFKA_CONSUMER_NAME}:${report.emitter}`,
                    processedAt: new Date()
                }
            });
        } catch (error) {
            if ((error as any).code === "P2002") {
                return false;
            }

            throw error;
        }

        return true;
    }

}

export const processedEventRepository = new ProcessedEventRepository();