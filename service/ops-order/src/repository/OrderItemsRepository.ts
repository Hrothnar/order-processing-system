import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { prisma } from "../config/PrismaConfig";
import { OrderItemsRequest } from "../schema/ExternalSchemas";
import { PrismaClient } from "@prisma/client";

export class OrderItemRepository {

    async createRecord(items: OrderItemsRequest[], client: Omit<PrismaClient, ITXClientDenyList> = prisma): Promise<any> {
        client.orderItem.createManyAndReturn({
            data: {

            }
        })


    }

}

export const orderItemRepository = new OrderItemRepository();