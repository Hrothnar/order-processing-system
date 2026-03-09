import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { Order, OrderItem, PrismaClient } from "@prisma/client";

import { orderItemRepository } from "../repository/OrderItemsRepository.js";
import { OrderItemsRequestSchema } from "../schema/ExternalSchemas.js";

export class OrderItemService {

    async createOrderItems(items: OrderItemsRequestSchema[], order: Order, client?: Omit<PrismaClient, ITXClientDenyList>): Promise<OrderItem[]> {
        return orderItemRepository.createOrderItems(items, order, client);
    }


}

export const orderItemService = new OrderItemService();