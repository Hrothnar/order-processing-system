import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/PrismaConfig";
import { ITXClientDenyList, Omit } from "@prisma/client/runtime/library";

export class OrderRepository {

    async createOrder(client: Omit<PrismaClient, ITXClientDenyList> = prisma) {

        const result = await client.order.create({data: {}});

        return result;
    }

}

export const orderRepository = new OrderRepository();