import { randomUUID } from "node:crypto";

import { Decimal } from "@prisma/client/runtime/library";

import { externalHandler } from "../../handler/ExternalHandler";
import { prisma } from "../../config/PrismaConfig";
import { createOrder, idempotencyKey } from "../util";

test("must create an order", async () => {
    await externalHandler.createOrder(createOrder, idempotencyKey);

    const order = await prisma.order.findFirst();
    const orderItems = (await prisma.orderItem.findMany()).sort((x, y) => x.sku.localeCompare(y.sku));
    const outbox = await prisma.outbox.findFirst();
    const idempotency = await prisma.idempotency.findFirst();

    expect(await prisma.order.count()).toBe(1);
    expect(await prisma.orderItem.count()).toBe(3);
    expect(await prisma.outbox.count()).toBe(1);
    expect(await prisma.idempotency.count()).toBe(1);

    expect(order).toMatchObject({
        customerId: 'fd61c63a-2383-4812-bc9e-e2742d52f48e',
        status: 'PENDING',
        currency: 'USD',
        address: 'USA, Minnesota, Saint Lois Str. 15',
        totalAmount: new Decimal(100.06),
        failureReason: null
    });

    expect(orderItems).toMatchObject([
        { sku: 'sku-1', quantity: new Decimal(23.14), unitPrice: new Decimal(15.56) },
        { sku: 'sku-2', quantity: new Decimal(90), unitPrice: new Decimal(14) },
        { sku: 'sku-3', quantity: new Decimal(2), unitPrice: new Decimal(70.5) }
    ]);

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
            address: { city: 'Minnesota', country: 'USA', addressLine1: 'Saint Lois Str. 15' },
            currency: 'USD',
            customerId: 'fd61c63a-2383-4812-bc9e-e2742d52f48e',
            totalAmount: 100.06
        },
        status: 'PENDING',
        retryCount: 0,
        lockedBy: null,
        lockedAt: null,
        nextAttemptAt: null,
        publishedAt: null,
    });

    expect(idempotency).toMatchObject({
        key: 'some-idempotency-key',
        requestHash: '4d76fd0d465f1f1336df4ab4e9f8f8e152f90ff2ab55010c9302b8bc1dd897c3',
        responseStatus: 201,
        responseBody: {
            status: 'PENDING',
            currency: 'USD',
            totalAmount: 100.06
        },
        resourceType: 'order',
    });
});

test("the same request must return the same response (the same request body)", async () => {
    const response1 = await externalHandler.createOrder(createOrder, idempotencyKey);
    const response2 = await externalHandler.createOrder(createOrder, idempotencyKey);

    expect({ ...response1, createdAt: response1.createdAt.toISOString() }).toMatchObject(response2);
});

test("must throw and error on the second create request (different request body)", async () => {
    await externalHandler.createOrder(createOrder, idempotencyKey);

    expect(externalHandler.createOrder({ ...createOrder, currency: "EUR" }, idempotencyKey)).rejects.toThrow();
});
