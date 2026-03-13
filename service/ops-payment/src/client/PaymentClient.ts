import { OrderOutboxPayload } from "../type/Type.js";

export class PaymentClient {

    /**
     * Validation imitation
     * @param payload 
     * @returns boolean
     */
    async validatePayment(payload: OrderOutboxPayload): Promise<boolean> {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
            method: "PUT",
            body: JSON.stringify({
                id: 1,
                title: "fun",
                body: "bar",
                userId: 1,
            }),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        });

        console.log("Payment validation response:", await response.json());

        return true;
    }
}

export const paymentClient = new PaymentClient();