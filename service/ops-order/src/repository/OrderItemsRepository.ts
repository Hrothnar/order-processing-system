import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { Order, OrderItem, PrismaClient } from "@prisma/client";

import { prisma } from "../config/PrismaConfig.js";
import { OrderItemsRequestSchema } from "../schema/ExternalSchemas.js";

export class OrderItemRepository {

    async createOrderItems(items: OrderItemsRequestSchema[], order: Order, client?: Omit<PrismaClient, ITXClientDenyList>): Promise<OrderItem[]> {
        const orderItems = await client.orderItem.createManyAndReturn({
            data: items.map((item) => ({ orderId: order.id, sku: item.sku, quantity: item.quantity, unitPrice: item.unitPrise }))
        });

        return orderItems;
    }

}

export const orderItemRepository = new OrderItemRepository();