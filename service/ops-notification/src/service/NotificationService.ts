import { notificationClient } from "../client/NotificationClient.js";
import { OrderOutboxPayload } from "../type/Type.js";

export class NotificationService {

    async sendNotification(payload: OrderOutboxPayload): Promise<boolean> {
        const result = await notificationClient.sendNotification(payload);

        return result;
    }

}

export const notificationService = new NotificationService();