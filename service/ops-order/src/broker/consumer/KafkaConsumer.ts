import { EachMessagePayload } from "kafkajs";

import { EventHandle } from "../../type/Type.js";
import { orderService } from "../../service/OrderService.js";
import { prisma } from "../../config/PrismaConfig.js";
import { processedEventService } from "../../service/ProcessedEventService.js";

export class KafkaConsumer {

    handleMessage = async (message: EachMessagePayload): Promise<void> => {
        const event: EventHandle = JSON.parse(message.message.value.toString());

        await prisma.$transaction(async (tx) => {
            await processedEventService.createRecord(event, tx);
            await orderService.updateStatus(event, tx);
        });

        console.log(`[Kafka] --- Message [${event.eventId}] from [${event.emitter}] was successfully handled`);
    }
}

export const kafkaConsumer = new KafkaConsumer();