import { Cool } from "../type/Type.js";

export class UtilityHandler {
    
    async liveness(): Promise<Cool> {
        return { isItCool: true };
    }

    async readiness(): Promise<Cool> {
        return { isItCool: true };
    }
}

export const utilityHandler = new UtilityHandler();