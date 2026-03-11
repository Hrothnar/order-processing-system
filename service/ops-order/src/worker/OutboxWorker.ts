import { kafkaProducer } from "../broker/producer/KafkaProducer.js";
import { outboxService } from "../service/OutboxService.js";
import { OrderOutboxPayload } from "../type/Type.js";
import * as ENV from "../type/Env.js";

export class OutboxWorker {

    private map = new Map<string, NodeJS.Timeout>();

    registerWorker(): void {
        let cycle = 1;
        const interval = setInterval(async () => {
            await outboxService.recuperateExpiredLeases();

            const selectedOutboxRecords = await outboxService.claimBatch(8);

            if (selectedOutboxRecords.length) {
                for (const outboxRecord of selectedOutboxRecords) {
                    const { payload, id } = outboxRecord;
                    try {
                        await kafkaProducer.send(payload as unknown as OrderOutboxPayload);
                        throw new Error("AAAAAAAAAAa");
                        await outboxService.markAsPublished(Number(id));
                    } catch (error) {
                        await outboxService.markForRetry(Number(id));
                        console.log(`[OutboxWorker]\t\tOutbox record [${outboxRecord.id}] was not fully published, marked for retry`);
                    }
                }
            }

            console.log(`[OutboxWorker]\t\tOutbox worker cycle [${cycle++}] on PPID [${process.ppid}] has successfully published [${selectedOutboxRecords.length}] records. Time: ${new Date()}`);
        }, ENV.OUTBOX_WORKER_CYCLE_DELAY_MIN * 60 * 1000);

        this.map.set("outbox-worker", interval);

        console.log(`[OutboxWorker]\t\tOutbox worker has been registered with the cycle time ${ENV.OUTBOX_WORKER_CYCLE_DELAY_MIN} min.`);
    }
}

export const outboxWorker = new OutboxWorker();