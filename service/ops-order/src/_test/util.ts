import { RecordMetadata } from "kafkajs";

import { kafkaProducer } from "../broker/producer/KafkaProducer";
import { CreateOrderRequest } from "../schema/ExternalSchemas";
import { EventEmit } from "../type/Type";

export const SPY: {
    send: jest.SpyInstance
} = {
    send: null
};

export const idempotencyKey = "some-idempotency-key";
export const createOrder: CreateOrderRequest = {
    customerId: "fd61c63a-2383-4812-bc9e-e2742d52f48e",
    currency: "USD",
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

export function intercept(): void {
    SPY.send = jest.spyOn(kafkaProducer, "send").mockImplementation(
        async (data: EventEmit, topic: string): Promise<RecordMetadata[]> => { return null }
    );
}