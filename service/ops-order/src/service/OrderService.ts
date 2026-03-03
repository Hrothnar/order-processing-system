import { prisma } from "../config/PrismaConfig.js";
import { orderRepository } from "../repository/OrderRepository.js";
import { CreateOrderRequest, CreateOrderResponse } from "../schema/ExternalSchemas.js";
import { idempotencyService } from "./IdempotencyService.js";
import { orderItemService } from "./OrderItemsService.js";

export class OrderService {

    async createOrder(input: CreateOrderRequest, idempotencyKey: string): Promise<CreateOrderResponse> {
        const result = await prisma.$transaction(async (tx) => {

            const idempotencyRecord = await idempotencyService.findRecord(idempotencyKey, tx);

            if (idempotencyRecord) {
                return idempotencyRecord.responseBody as unknown as CreateOrderResponse;
            }

            await orderRepository.createOrder(tx);
            await orderItemService.createOrderItems(input.items, tx);

        });


        return result;
    }

}

export const orderService = new OrderService();