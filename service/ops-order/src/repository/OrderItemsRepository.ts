import { Order, OrderItem } from "@prisma/client";

import { OrderItemsRequestSchema } from "../schema/ExternalSchemas.js";
import { DbClient } from "../type/Type.js";
import { prisma } from "../config/PrismaConfig.js";

export class OrderItemRepository {

    async createOrderItems(items: OrderItemsRequestSchema[], order: Order, db: DbClient = prisma): Promise<OrderItem[]> {
        const formattedItems = items.map((item) => ({ orderId: order.id, sku: item.sku, quantity: item.quantity, unitPrice: item.unitPrice }));
        const result = await db.orderItem.createManyAndReturn({ data: formattedItems });

        return result;
    }

}

export const orderItemRepository = new OrderItemRepository();