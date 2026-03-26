import { inventoryClient } from "../client/InventoryClient.js";
import { OrderOutboxPayload } from "../type/Type.js";

export class InventoryService {

    async checkInventory(payload: OrderOutboxPayload): Promise<boolean> {
        const result = await inventoryClient.checkInventory(payload);

        return result;
    }

}

export const inventoryService = new InventoryService();