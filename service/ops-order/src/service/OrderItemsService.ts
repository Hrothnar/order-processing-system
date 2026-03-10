import { Order, OrderItem } from "@prisma/client";

import { orderItemRepository } from "../repository/OrderItemsRepository.js";
import { OrderItemsRequestSchema } from "../schema/ExternalSchemas.js";
import { DbClient } from "../type/Type.js";

export class OrderItemService {

    async createOrderItems(items: OrderItemsRequestSchema[], order: Order, db?: DbClient): Promise<OrderItem[]> {
        const orderItems = await orderItemRepository.createOrderItems(items, order, db);

        return orderItems;
    }


}

export const orderItemService = new OrderItemService();