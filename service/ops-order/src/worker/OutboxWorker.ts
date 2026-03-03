import { kafkaProducer } from "../broker/producer/KafkaProducer.js";
import { outboxService } from "../service/OutboxService.js";
import * as ENV from "../type/Env.js";

export class OutboxWorker {

    private map = new Map<string, NodeJS.Timeout>();

    registerWorker(): void {
        const interval = setInterval(async () => {
            console.log(`Interval job is triggered`);
            await outboxService.recuperateExpiredLeases();

            const selectedOutboxRecords = await outboxService.claimBatch(8);

            if (selectedOutboxRecords.length) {
                for (const outboxRecord of selectedOutboxRecords) {
                    try {
                        await kafkaProducer.send(outboxRecord.payload);
                        await outboxService.markAsPublished(outboxRecord.id);
                    } catch (error) {
                        await outboxService.markForRetry(outboxRecord.id);
                        console.log(`Outbox record ${outboxRecord.id} was not fully published, marked for retry`);
                    }
                }
            }
        }, ENV.OUTBOX_WORKER_CYCLE_DELAY_MIN * 60 * 1000);

        this.map.set("outbox-worker", interval);

        console.log(`Outbox worker has been registered with the cycle time ${ENV.OUTBOX_WORKER_CYCLE_DELAY_MIN} min.`);
    }
}

export const outboxWorker = new OutboxWorker();