import { prisma } from "../config/PrismaConfig.js";
import { orderRepository } from "../repository/OrderRepository.js";
import { CreateOrderRequest, CreateOrderResponse, GetOrderResponse } from "../schema/ExternalSchemas.js";
import { idempotencyService } from "./IdempotencyService.js";
import { orderItemService } from "./OrderItemsService.js";
import { outboxService } from "./OutboxService.js";
import { hash } from "../util/Utility.js";
import { Exception } from "../exception/Exception.js";

export class OrderService {

    async createOrder(input: CreateOrderRequest, idempotencyKey: string): Promise<CreateOrderResponse> {
        const result = await prisma.$transaction(async (tx) => {
            const idempotencyRecord = await idempotencyService.findRecord(idempotencyKey, tx);

            if (idempotencyRecord) {
                if (idempotencyRecord.requestHash === hash(input)) {
                    return idempotencyRecord.responseBody as unknown as CreateOrderResponse;
                } else {
                    throw new Exception(`Request has the same idempotencyKey but the body hashes differ`);
                }
            }

            const order = await orderRepository.createOrder(input, tx);
            await orderItemService.createOrderItems(input.items, order, tx);
            await outboxService.createOrderRecord(input, order, tx);

            const responseBody: CreateOrderResponse = {
                createdAt: order.createdAt,
                currency: order.currency,
                orderId: order.id,
                status: order.status,
                totalAmount: order.totalAmount.toNumber()
            };

            await idempotencyService.createOrderRecord(idempotencyKey, input, order, responseBody, tx);

            return responseBody;
        });

        return result;
    }

    async getOrder(orderId: string): Promise<GetOrderResponse> {
        const order = await orderRepository.findOrderOrThrow(orderId);

        const result: GetOrderResponse = {
            status: order.status,
            totalAmount: order.totalAmount.toNumber(),
            failureReason: order.failureReason,
            items: order.items.map((item) => ({
                quantity: item.quantity.toNumber(),
                sku: item.sku,
                unitPrice: item.unitPrice.toNumber()
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        return result;
    }

    async listOrders()

}

export const orderService = new OrderService();