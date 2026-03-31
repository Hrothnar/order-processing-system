import { OutboxStatus } from "@prisma/client";

import { prisma } from "../../config/PrismaConfig";
import { externalHandler } from "../../handler/ExternalHandler";
import { outboxWorker } from "../../worker/OutboxWorker";
import { createOrder, idempotencyKey } from "../util";
import { kafkaProducer } from "../../broker/producer/KafkaProducer";
import * as ENV from "../../type/Env";

test("must work correctly (healthy flow)", async () => {
    await externalHandler.createOrder(createOrder, idempotencyKey);

    await outboxWorker.processWork();

    const outbox = await prisma.outbox.findFirst();

    expect(outbox).toMatchObject({
        aggregateType: 'order',
        eventName: 'OrderCreated',
        eventVersion: 1,
        payload: {
            items: [
                { sku: 'sku-1', quantity: 23.14, unitPrice: 15.56 },
                { sku: 'sku-2', quantity: 90, unitPrice: 14 },
                { sku: 'sku-3', quantity: 2, unitPrice: 70.5 }
            ],
            address: {
                city: 'Minnesota',
                country: 'USA',
                addressLine1: 'Saint Lois Str. 15'
            },
            currency: 'USD',
            customerId: 'fd61c63a-2383-4812-bc9e-e2742d52f48e',
            totalAmount: 100.06
        },
        status: 'PUBLISHED',
        retryCount: 0,
        lockedBy: null,
        lockedAt: null,
        nextAttemptAt: null,
    });
});

test("must work correctly (recuperated flow)", async () => {
    await externalHandler.createOrder(createOrder, idempotencyKey);

    await prisma.outbox.update({
        where: { id: 1n },
        data: { status: OutboxStatus.PROCESSING, lockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    });

    const outbox1 = await prisma.outbox.findFirst();

    await outboxWorker.processWork();

    const outbox2 = await prisma.outbox.findFirst();

    expect(outbox1.status).toBe(OutboxStatus.PROCESSING);
    expect(outbox1.lockedAt).toBeTruthy();

    expect(outbox2.status).toBe(OutboxStatus.PUBLISHED);
    expect(outbox2.lockedAt).toBeFalsy();
});

test("must work correctly (failed attempts < max retries)", async () => {
    await externalHandler.createOrder(createOrder, idempotencyKey);

    jest.spyOn(kafkaProducer, "send").mockRejectedValueOnce(null);

    const outbox1 = await prisma.outbox.findFirst();

    await outboxWorker.processWork();

    const outbox2 = await prisma.outbox.findFirst();

    expect(outbox1.status).toBe(OutboxStatus.PENDING);
    expect(outbox1.retryCount).toBe(0);

    expect(outbox2.status).toBe(OutboxStatus.PENDING);
    expect(outbox2.retryCount).toBe(1);
    expect(outbox2.lockedBy).toBe(null);
    expect(outbox2.nextAttemptAt).toBeTruthy();
    expect(outbox2.publishedAt).toBe(null);
});

test("must work correctly (failed attempts < max retries) and process a failed event", async () => {
    await externalHandler.createOrder(createOrder, idempotencyKey);

    jest.spyOn(kafkaProducer, "send").mockRejectedValueOnce(null);

    const outbox1 = await prisma.outbox.findFirst();

    await outboxWorker.processWork();

    await prisma.outbox.update({ where: { id: 1n }, data: { nextAttemptAt: new Date() } });

    await outboxWorker.processWork();

    const outbox2 = await prisma.outbox.findFirst();

    expect(outbox1.status).toBe(OutboxStatus.PENDING);
    expect(outbox1.retryCount).toBe(0);

    expect(outbox2.status).toBe(OutboxStatus.PUBLISHED);
    expect(outbox2.retryCount).toBe(1);
    expect(outbox2.lockedBy).toBe(null);
    expect(outbox2.nextAttemptAt).toBeTruthy();
    expect(outbox2.publishedAt).toBeTruthy();
});

test("must work correctly (failed attempts >= max retries)", async () => {
    await externalHandler.createOrder(createOrder, idempotencyKey);

    const spy = jest.spyOn(kafkaProducer, "send").mockRejectedValue(null);

    await outboxWorker.processWork();

    await prisma.outbox.update({ where: { id: 1n }, data: { nextAttemptAt: new Date(), retryCount: ENV.OUTBOX_WORKER_MAX_RETRIES } });

    await outboxWorker.processWork();

    const outbox2 = await prisma.outbox.findFirst();

    expect(outbox2.status).toBe(OutboxStatus.FAILED);
    expect(outbox2.retryCount).toBe(ENV.OUTBOX_WORKER_MAX_RETRIES + 1);
    expect(outbox2.lockedBy).toBe(null);
    expect(outbox2.lockedAt).toBe(null);
    expect(outbox2.nextAttemptAt).toBe(null);
    expect(outbox2.publishedAt).toBe(null);

    spy.mockClear();
});