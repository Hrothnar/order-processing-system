import { CreateOrderRequest } from "../schema/ExternalSchemas.js";

export class OrderService {

    async createOrder(input: CreateOrderRequest): Promise<any> {
        return { areYouCrazy: "probably" };
    }

}

export const orderService = new OrderService();