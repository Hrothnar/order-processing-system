import { randomUUID } from "node:crypto";

import { EachMessagePayload } from "kafkajs";

import { EventEmit, EventHandle, OrderStatus } from "../../type/Type.js";
import { kafkaProducer } from "../producer/KafkaProducer.js";
import { fulfillmentService } from "../../service/FulfillmentService.js";
import { KAFKA_PRODUCER_NAME } from "../../type/Env.js";

export class KafkaConsumer {

    handleMessage = async (message: EachMessagePayload): Promise<void> => {
        const caughtEvent: EventHandle = JSON.parse(message.message.value.toString());

        const result = await fulfillmentService.checkLegitimacy(caughtEvent.payload);

        const event: EventEmit = {
            eventId: randomUUID(),
            emitter: KAFKA_PRODUCER_NAME,
            createdAt: new Date(),
            payload: {
                failureReason: null,
                orderId: caughtEvent.payload.orderId,
                status: OrderStatus.FULFILLED
            }
        };

        if (!result) {
            event.payload = {
                failureReason: `Order could not fulfilled due to some circumstances`, // can read an error reason from the validation result and insert it here
                orderId: caughtEvent.payload.orderId,
                status: OrderStatus.FULFILLMENT_REQUESTED
            }
        }

        await kafkaProducer.send(event);

        console.log(`[Kafka] --- Message [${caughtEvent.eventId}] from [${caughtEvent.emitter}] was successfully handled`);
    }
}

export const kafkaConsumer = new KafkaConsumer();