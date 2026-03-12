import { EachMessagePayload } from "kafkajs";

import { EventHandle } from "../../type/Type.js";

export class KafkaConsumer {

    handleMessage = async (message: EachMessagePayload): Promise<void> => {
        const event: EventHandle = JSON.parse(message.message.value.toString());

        // logic...

        console.log(`[Kafka]\t\tMessage [${event.eventId} from [${event.emitter}] was successfully handled]`);
    }
}

export const kafkaConsumer = new KafkaConsumer();