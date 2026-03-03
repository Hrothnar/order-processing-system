import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { orderItemRepository } from "../repository/OrderItemsRepository.js";
import { OrderItemsRequest } from "../schema/ExternalSchemas.js";
import { PrismaClient } from "@prisma/client";

export class OrderItemService {

    async createOrderItems(items: OrderItemsRequest[], client?: Omit<PrismaClient, ITXClientDenyList>): Promise<any> {
        return orderItemRepository.createRecord(items);
    }


}

export const orderItemService = new OrderItemService();