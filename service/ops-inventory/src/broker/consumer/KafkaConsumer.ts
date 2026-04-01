import { randomUUID } from "node:crypto";

import { EachMessagePayload } from "kafkajs";

import { EventEmit, EventHandle, OrderStatus } from "../../type/Type.js";
import { kafkaProducer } from "../producer/KafkaProducer.js";
import { inventoryService } from "../../service/InventoryService.js";
import { KAFKA_PRODUCER_NAME } from "../../type/Env.js";

export class KafkaConsumer {

    handleMessage = async (message: EachMessagePayload): Promise<void> => {
        const caughtEvent: EventHandle = JSON.parse(message.message.value.toString());

        const result = await inventoryService.checkInventory(caughtEvent.payload);

        const event: EventEmit = {
            eventId: randomUUID(),
            emitter: KAFKA_PRODUCER_NAME,
            createdAt: new Date(),
            payload: {
                failureReason: null,
                orderId: caughtEvent.payload.orderId,
                status: OrderStatus.INVENTORY_RESERVED
            }
        };

        if (!result) {
            event.payload = {
                failureReason: `Some of all of the items: ${caughtEvent.payload.items} could not be find in inventory`, // can read an error reason from the validation result and insert it here
                orderId: caughtEvent.payload.orderId,
                status: OrderStatus.INVENTORY_REJECTED
            }
        }

        await kafkaProducer.send(event);

        console.log(`[Kafka] --- Message [${caughtEvent.eventId}] from [${caughtEvent.emitter}] was successfully handled`);
    }
}

export const kafkaConsumer = new KafkaConsumer();