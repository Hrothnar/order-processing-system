import { paymentClient } from "../client/PaymentClient.js";
import { OrderOutboxPayload } from "../type/Type.js";

export class PaymentService {

    async validatePayment(payload: OrderOutboxPayload): Promise<boolean> {
        const result = await paymentClient.validatePayment(payload);

        return result;
    }

}

export const paymentService = new PaymentService();