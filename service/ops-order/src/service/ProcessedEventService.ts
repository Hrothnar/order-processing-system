import { processedEventRepository } from "../repository/ProcessedEventRepository.js";
import { DbClient, EventHandle } from "../type/Type.js";

export class ProcessedEventService {

    async createRecord(event: EventHandle, db?: DbClient): Promise<boolean> {
        const result = await processedEventRepository.createRecord(event, db);

        return result;
    }

}

export const processedEventService = new ProcessedEventService();