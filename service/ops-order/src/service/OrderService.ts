import { VCreateOrder } from "../validation/ExternalValidator";

export class OrderService {

    async createOrder(input: VCreateOrder): Promise<any> {
        
    }

}

export const orderService = new OrderService();