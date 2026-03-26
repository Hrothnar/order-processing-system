import { randomUUID } from "node:crypto";

import { externalHandler } from "../../handler/ExternalHandler";
import { CreateOrderRequest } from "../../schema/ExternalSchemas";

test("must create an order", async () => {
    const idempotencyKey = "some-idempotency-key";
    const createOrder: CreateOrderRequest = {
        customerId: randomUUID() || "some-custom-id",
        currency: "usd",
        items: [
            { sku: "sku-1", quantity: 23.14, unitPrice: 15.56 },
            { sku: "sku-2", quantity: 90, unitPrice: 14 },
            { sku: "sku-3", quantity: 2, unitPrice: 70.50 }
        ],
        shippingAddress: {
            country: "USA",
            city: "Minnesota",
            addressLine1: "Saint Lois Str. 15"
        }
    };

    await externalHandler.createOrder(createOrder, idempotencyKey);
});