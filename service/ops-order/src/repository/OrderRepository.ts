import { Order, OrderItem, OrderStatus, Prisma, PrismaClient } from "@prisma/client";
import { ITXClientDenyList, Omit } from "@prisma/client/runtime/library";

import { prisma } from "../config/PrismaConfig.js";
import { CreateOrderRequest } from "../schema/ExternalSchemas.js";
import { OrderWithItems } from "../type/Type.js";
import { Exception } from "../exception/Exception.js";

export class OrderRepository {

    async createOrder(input: CreateOrderRequest, client: Omit<PrismaClient, ITXClientDenyList> = prisma): Promise<Order> {
        const result = await client.order.create({
            data: {
                address: `${input.shippingAddress.country}, ${input.shippingAddress.city}, ${input.shippingAddress.addressLine1}`,
                currency: input.currency,
                totalAmount: input.items.reduce((accumulator, item) => accumulator += item.unitPrice, 0),
                customerId: input.customerId,
                status: OrderStatus.PENDING
            }
        });

        return result;
    }

    async findOrder(orderId: string, client: Omit<PrismaClient, ITXClientDenyList> = prisma): Promise<OrderWithItems> {
        const result = await client.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        return result;
    }

    async findOrderOrThrow(orderId: string, client: Omit<PrismaClient, ITXClientDenyList> = prisma): Promise<OrderWithItems> {
        const order = await this.findOrder(orderId);

        if (!order) {
            throw new Exception(`Order with id ${order} was not found`);
        }

        return order;
    }

}

export const orderRepository = new OrderRepository();