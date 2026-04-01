import { randomUUID } from "node:crypto";

import { Order, OrderStatus } from "@prisma/client";

import { orderRepository } from "../repository/OrderRepository.js";
import { Exception } from "../exception/Exception.js";
import { kafkaProducer } from "../broker/producer/KafkaProducer.js";
import { CreateOrderRequest, ListOrdersRequestQuery, ListOrdersResponse } from "../schema/ExternalSchemas.js";
import { DbClient, EventEmit, EventHandle, HandlerFunction, OrderInfo, OrderWithItems } from "../type/Type.js";
import { KAFKA_PRODUCER_FULFILLMENT_TOPIC_NAME, KAFKA_PRODUCER_INVENTORY_TOPIC_NAME, KAFKA_PRODUCER_NAME, KAFKA_PRODUCER_NOTIFICATION_TOPIC_NAME } from "../type/Env.js";

export class OrderService {

    private VALIDATION_CHAIN: Record<OrderStatus, HandlerFunction> = {
        [OrderStatus.PENDING]: async (event: EventHandle, info: OrderInfo): Promise<void> => { },
        [OrderStatus.CANCELLED]: async (event: EventHandle, info: OrderInfo): Promise<void> => { },
        [OrderStatus.COMPLETED]: async (event: EventHandle, info: OrderInfo): Promise<void> => { },
        [OrderStatus.PAYMENT_AUTHORIZED]: this.validateInventory,
        [OrderStatus.PAYMENT_FAILED]: async (event: EventHandle, info: OrderInfo): Promise<void> => { },
        [OrderStatus.INVENTORY_RESERVED]: this.validateFulfillment,
        [OrderStatus.INVENTORY_REJECTED]: async (event: EventHandle, info: OrderInfo): Promise<void> => { },
        [OrderStatus.FULFILLMENT_REQUESTED]: async (event: EventHandle, info: OrderInfo): Promise<void> => { },
        [OrderStatus.FULFILLED]: async (event: EventHandle, info: OrderInfo): Promise<void> => { }
    }

    async createOrder(input: CreateOrderRequest, db?: DbClient): Promise<Order> {
        const order = await orderRepository.createOrder(input, db);

        return order;
    }

    async findOrder(orderId: string, db?: DbClient): Promise<OrderWithItems> {
        const order = await orderRepository.findOrder(orderId, db);

        return order;
    }

    async findOrderOrThrow(orderId: string, db?: DbClient): Promise<OrderWithItems> {
        const order = await this.findOrder(orderId, db);
        if (!order) throw new Exception(`Order with id ${orderId} was not found`);

        return order;
    }

    async findOrders(query: ListOrdersRequestQuery, db?: DbClient): Promise<ListOrdersResponse> {
        const orderList = await orderRepository.findOrders(query, db);

        return orderList;
    }

    async updateStatus(event: EventHandle, db?: DbClient): Promise<Order> {
        const order = await orderRepository.updateStatus(event, db);

        return order;
    }

    async getAsOrderInfo(orderId: string, db?: DbClient): Promise<OrderInfo> {
        const order = await orderRepository.findOrder(orderId, db);

        if (!order) {
            throw new Exception(`Order under id ${orderId} was not found`);
        }

        const splittedAddress = order.address.split(", ");

        const orderInfo: OrderInfo = {
            orderId: orderId,
            address: {
                country: splittedAddress[0],
                city: splittedAddress[1],
                addressLine1: splittedAddress[2]
            },
            currency: order.currency,
            customerId: order.customerId,
            totalAmount: Number(order.totalAmount),
            items: order.items.map((item) => ({
                quantity: item.quantity.toNumber(),
                sku: item.sku,
                unitPrice: item.unitPrice.toNumber()
            })),
            createdAt: order.createdAt
        };

        return orderInfo;
    }

    async proceedInValidationChain(eventHandle: EventHandle): Promise<void> {
        const status = eventHandle.payload.status as OrderStatus;
        const orderId = eventHandle.payload.orderId;
        const handler = this.VALIDATION_CHAIN[status];

        if (!handler) {
            throw new Exception(`Validator for ${status} was not found`);
        }

        const orderInfo = await this.getAsOrderInfo(orderId);

        await handler(eventHandle, orderInfo);
    }

    async validateInventory(eventHandle: EventHandle, payload: OrderInfo): Promise<void> {
        const event: EventEmit = {
            eventId: randomUUID(),
            createdAt: new Date(),
            emitter: KAFKA_PRODUCER_NAME,
            payload: payload
        };

        await kafkaProducer.send(event, KAFKA_PRODUCER_INVENTORY_TOPIC_NAME);
    }

    async validateFulfillment(eventHandle: EventHandle, payload: OrderInfo): Promise<void> {
        const event: EventEmit = {
            eventId: randomUUID(),
            createdAt: new Date(),
            emitter: KAFKA_PRODUCER_NAME,
            payload: payload
        };

        await kafkaProducer.send(event, KAFKA_PRODUCER_NOTIFICATION_TOPIC_NAME);
        await kafkaProducer.send(event, KAFKA_PRODUCER_FULFILLMENT_TOPIC_NAME);
    }
}

export const orderService = new OrderService();