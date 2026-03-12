import { prisma } from "../config/PrismaConfig.js";
import { Exception } from "../exception/Exception.js";
import { idempotencyService } from "../service/IdempotencyService.js";
import { orderItemService } from "../service/OrderItemsService";
import { orderService } from "../service/OrderService.js";
import { outboxService } from "../service/OutboxService";
import { hash } from "../util/Utility.js";
import { CreateOrderRequest, CreateOrderResponse, GetOrderResponse, ListOrdersRequestQuery, ListOrdersResponse } from "../schema/ExternalSchemas.js";

export class ExternalHandler {

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

            const order = await orderService.createOrder(input, tx);
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
        const order = await orderService.findOrderOrThrow(orderId);

        const result: GetOrderResponse = {
            id: order.id,
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

    async listOrders(input: ListOrdersRequestQuery): Promise<ListOrdersResponse> {
        const result = await prisma.$transaction(async (tx) => orderService.findOrders(input, tx));

        return result;
    }
}

export const externalHandler = new ExternalHandler();