import { fulfillment } from "../client/InventoryClient.js";
import { OrderOutboxPayload } from "../type/Type.js";

export class FulfillmentService {

    async checkLegitimacy(payload: OrderOutboxPayload): Promise<boolean> {
        const result = await fulfillment.checkLegitimacy(payload);

        return result;
    }

}

export const fulfillmentService = new FulfillmentService();