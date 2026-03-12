import { Order } from "@prisma/client";

import { orderRepository } from "../repository/OrderRepository.js";
import { CreateOrderRequest, ListOrdersRequestQuery, ListOrdersResponse } from "../schema/ExternalSchemas.js";
import { Exception } from "../exception/Exception.js";
import { DbClient, EventHandle, OrderWithItems } from "../type/Type.js";

export class OrderService {

    async createOrder(input: CreateOrderRequest, db?: DbClient): Promise<Order> {
        const order = await orderRepository.createOrder(input, db);

        return order;
    }

    async findOrder(orderId: string, db?: DbClient): Promise<OrderWithItems> {
        const order = await orderRepository.findOrder(orderId, db);

        return order;
    }

    async findOrderOrThrow(orderId: string, db?: DbClient): Promise<OrderWithItems> {
        const order = await this.findOrder(orderId, db);
        if (!order) throw new Exception(`Order with id ${orderId} was not found`);

        return order;
    }

    async findOrders(query: ListOrdersRequestQuery, db?: DbClient): Promise<ListOrdersResponse> {
        const orderList = await orderRepository.findOrders(query, db);

        return orderList;
    }

    async updateStatus(event: EventHandle, db?: DbClient): Promise<Order> {
        const order = await orderRepository.updateStatus(event, db);

        return order;
    }
}

export const orderService = new OrderService();