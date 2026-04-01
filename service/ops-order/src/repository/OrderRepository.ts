import { Order, OrderStatus, Prisma } from "@prisma/client";

import { CreateOrderRequest, ListOrdersRequestQuery, ListOrdersResponse } from "../schema/ExternalSchemas.js";
import { DbClient, EventHandle, OrderWithItems } from "../type/Type.js";
import { prisma } from "../config/PrismaConfig.js";

export class OrderRepository {

    async createOrder(input: CreateOrderRequest, db: DbClient = prisma): Promise<Order> {
        const result = await db.order.create({
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

    async findOrder(orderId: string, db: DbClient = prisma): Promise<OrderWithItems> {
        const result = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        return result;
    }

    async findOrders(query: ListOrdersRequestQuery, db: DbClient = prisma): Promise<ListOrdersResponse> {
        const where: Prisma.OrderWhereInput = {
            ...(query.customerId && { customerId: query.customerId }),
            ...(query.status && { status: query.status }),
        };

        const skip = (query.page - 1) * query.size;
        const take = query.size;

        const orders = await db.order.findMany({
            where: where,
            skip: skip,
            take: take,
            orderBy: { createdAt: "desc" },
            include: { items: true }
        });

        const total = await db.order.count({ where: where });

        const formattedOrders = orders.map((order) => ({
            id: order.id,
            status: order.status,
            items: order.items.map((item) => ({
                quantity: item.quantity.toNumber(),
                sku: item.sku,
                unitPrice: item.unitPrice.toNumber()
            })),
            totalAmount: order.totalAmount.toNumber(),
            failureReason: order.failureReason,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }));

        const result: ListOrdersResponse = {
            data: formattedOrders,
            meta: {
                page: query.page,
                size: query.size,
                total: total,
                totalPages: Math.ceil(total / query.size),
            }
        };

        return result;
    }

    async updateStatus(event: EventHandle, db: DbClient = prisma): Promise<Order> {
        const result = await db.order.update({
            where: { id: event.payload.orderId },
            data: {
                status: event.payload.status,
                failureReason: event.payload.failureReason
            }
        });

        return result;
    }

}

export const orderRepository = new OrderRepository();