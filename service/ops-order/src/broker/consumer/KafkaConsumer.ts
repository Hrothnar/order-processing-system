import { EachMessagePayload } from "kafkajs";

import { EventHandle } from "../../type/Type.js";
import { orderService } from "../../service/OrderService.js";
import { prisma } from "../../config/PrismaConfig.js";
import { processedEventService } from "../../service/ProcessedEventService.js";

export class KafkaConsumer {

    handleMessage = async (message: EachMessagePayload): Promise<void> => {
        const caughtEvent: EventHandle = JSON.parse(message.message.value.toString());

        await prisma.$transaction(async (tx) => {
            const created = await processedEventService.createRecord(caughtEvent, tx);

            if (created) {
                await orderService.updateStatus(caughtEvent, tx);
                await orderService.proceedInValidationChain(caughtEvent);
            }
        });

        console.log(`[Kafka] --- Message [${caughtEvent.eventId}] from [${caughtEvent.emitter}] was successfully handled`);
    }
}

export const kafkaConsumer = new KafkaConsumer();