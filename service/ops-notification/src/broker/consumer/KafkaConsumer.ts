import { EachMessagePayload } from "kafkajs";

import { EventHandle } from "../../type/Type.js";
import { notificationService } from "../../service/NotificationService.js";

export class KafkaConsumer {

    handleMessage = async (message: EachMessagePayload): Promise<void> => {
        const caughtEvent: EventHandle = JSON.parse(message.message.value.toString());

        await notificationService.sendNotification(caughtEvent.payload);

        console.log(`[Kafka] --- Message [${caughtEvent.eventId}] from [${caughtEvent.emitter}] was successfully handled`);
    }
}

export const kafkaConsumer = new KafkaConsumer();