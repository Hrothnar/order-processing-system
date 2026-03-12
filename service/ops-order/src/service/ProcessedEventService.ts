import { ProcessedEvent } from "@prisma/client";

import { processedEventRepository } from "../repository/ProcessedEventRepository.js";
import { DbClient, EventHandle } from "../type/Type.js";

export class ProcessedEventService {

    async createRecord(event: EventHandle, db?: DbClient): Promise<ProcessedEvent> {
        const processedEvent = await processedEventRepository.createRecord(event, db);

        return processedEvent;
    }

}

export const processedEventService = new ProcessedEventService();