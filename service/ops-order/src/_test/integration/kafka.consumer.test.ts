import { EachMessagePayload } from "kafkajs";

import { OrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { kafkaConsumer } from "../../broker/consumer/KafkaConsumer";
import { EventHandle } from "../../type/Type";
import { externalHandler } from "../../handler/ExternalHandler";
import { createOrder, idempotencyKey, SPY } from "../util";
import { prisma } from "../../config/PrismaConfig";
import { KAFKA_PRODUCER_NAME } from "../../type/Env";

test("must correctly process caught Kafka message", async () => {
    const order = await externalHandler.createOrder(createOrder, idempotencyKey);

    const event: EventHandle = {
        createdAt: new Date(),
        emitter: "ops-payment-emitter",
        eventId: "e0be285a-7773-46e7-9054-15a1d1e066b8",
        payload: {
            failureReason: null,
            orderId: order.orderId,
            status: OrderStatus.PAYMENT_AUTHORIZED
        }
    };

    const message: EachMessagePayload = {
        message: {
            value: Buffer.from(JSON.stringify(event))
        }
    } as EachMessagePayload;

    await kafkaConsumer.handleMessage(message);

    const order2 = await prisma.order.findFirst();
    const processedEvent = await prisma.processedEvent.findFirst();

    expect(order2).toMatchObject({
        status: 'PAYMENT_AUTHORIZED',
        currency: 'USD',
        address: 'USA, Minnesota, Saint Lois Str. 15',
        totalAmount: new Decimal(100.06),
        failureReason: null,
    });

    expect(processedEvent).toMatchObject({
        eventId: event.eventId,
        consumerName: 'ops-order-consumer:ops-payment-emitter',
    });

    expect(SPY.send.mock.calls[0][0].emitter).toBe(KAFKA_PRODUCER_NAME);
});

test("must not process an already handled event and throw and error", async () => {
    const order = await externalHandler.createOrder(createOrder, idempotencyKey);

    const event: EventHandle = {
        createdAt: new Date(),
        emitter: "ops-payment-emitter",
        eventId: "e0be285a-7773-46e7-9054-15a1d1e066b8",
        payload: {
            failureReason: null,
            orderId: order.orderId,
            status: OrderStatus.PAYMENT_AUTHORIZED
        }
    };

    const message: EachMessagePayload = {
        message: { value: Buffer.from(JSON.stringify(event)) }
    } as EachMessagePayload;

    await kafkaConsumer.handleMessage(message);

    await expect(kafkaConsumer.handleMessage(message)).rejects.toThrow();
});