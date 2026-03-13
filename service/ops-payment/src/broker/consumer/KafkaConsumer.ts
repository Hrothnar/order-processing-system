import { randomUUID } from "node:crypto";

import { EachMessagePayload } from "kafkajs";

import { EventEmit, EventHandle, OrderStatus } from "../../type/Type.js";
import { kafkaProducer } from "../producer/KafkaProducer.js";
import { paymentService } from "../../service/PaymentService.js";
import { KAFKA_PRODUCER_NAME } from "../../type/Env.js";

export class KafkaConsumer {

    handleMessage = async (message: EachMessagePayload): Promise<void> => {
        const caughtEvent: EventHandle = JSON.parse(message.message.value.toString());

        const result = await paymentService.validatePayment(caughtEvent.payload);

        const event: EventEmit = {
            eventId: randomUUID(),
            emitter: KAFKA_PRODUCER_NAME,
            createdAt: new Date(),
            payload: {
                failureReason: null,
                orderId: caughtEvent.payload.orderId,
                status: OrderStatus.PAYMENT_AUTHORIZED
            }
        };

        if (!result) {
            event.payload = {
                failureReason: "Payment was not authorized", // can read an error reason from the validation result and insert it here
                orderId: caughtEvent.payload.orderId,
                status: OrderStatus.PAYMENT_FAILED
            }
        }

        await kafkaProducer.send(event);

        console.log(`[Kafka] --- Message [${event.eventId}] from [${event.emitter}] was successfully handled`);
    }
}

export const kafkaConsumer = new KafkaConsumer();