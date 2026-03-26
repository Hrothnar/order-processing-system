import { OrderOutboxPayload } from "../type/Type.js";

export class NotificationClient {

    /**
     * Validation imitation
     * @param payload 
     * @returns boolean
     */
    async sendNotification(payload: OrderOutboxPayload): Promise<boolean> {
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

        console.log("Response:", await response.json());

        return true;
    }
}

export const notificationClient = new NotificationClient();