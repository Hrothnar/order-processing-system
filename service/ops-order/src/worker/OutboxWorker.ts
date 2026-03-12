import { randomUUID } from "node:crypto";

import { kafkaProducer } from "../broker/producer/KafkaProducer.js";
import { outboxService } from "../service/OutboxService.js";
import { OrderOutboxPayload, EventEmit } from "../type/Type.js";
import { KAFKA_PRODUCER_NAME, OUTBOX_WORKER_CLAIM_BATCH_SIZE, OUTBOX_WORKER_CYCLE_DELAY_MIN } from "../type/Env.js";

export class OutboxWorker {

    private map = new Map<string, NodeJS.Timeout>();

    registerWorker(): void {
        let cycle = 1;
        const interval = setInterval(async () => {
            await outboxService.recuperateExpiredLeases();

            const selectedOutboxRecords = await outboxService.claimBatch(OUTBOX_WORKER_CLAIM_BATCH_SIZE);

            if (selectedOutboxRecords.length) {
                for (const outboxRecord of selectedOutboxRecords) {
                    const { payload, id } = outboxRecord;
                    try {
                        const event: EventEmit = {
                            eventId: randomUUID(),
                            createdAt: new Date(),
                            emitter: KAFKA_PRODUCER_NAME,
                            payload: payload as unknown as OrderOutboxPayload
                        };

                        await kafkaProducer.send(event);
                        await outboxService.markAsPublished(Number(id));
                    } catch (error) {
                        await outboxService.markForRetry(Number(id));
                        console.log(`[OutboxWorker]\t\tOutbox record [${outboxRecord.id}] was not fully published, marked for retry`);
                    }
                }
            }

            console.log(`[OutboxWorker]\t\tOutbox worker cycle [${cycle++}] on PPID [${process.ppid}] has successfully published [${selectedOutboxRecords.length}] records. Time: ${new Date()}`);
        }, OUTBOX_WORKER_CYCLE_DELAY_MIN * 60 * 1000);

        this.map.set("outbox-worker", interval);

        console.log(`[OutboxWorker]\t\tOutbox worker has been registered with the cycle time ${OUTBOX_WORKER_CYCLE_DELAY_MIN} min`);
    }
}

export const outboxWorker = new OutboxWorker();