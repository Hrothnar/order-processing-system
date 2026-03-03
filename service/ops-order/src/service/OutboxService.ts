import { outboxRepository } from "../repository/OutboxRepository.js";

export class OutboxService {

    async claimBatch(limit: number): Promise<any> {
        return outboxRepository.claimBatch(limit);
    }

    async markAsPublished(id: number): Promise<void> {
        return outboxRepository.markAsPublished(id);
    }

    async markForRetry(id: number): Promise<void> {
        return outboxRepository.markForRetry(id);
    }

    async recuperateExpiredLeases(): Promise<void> {
        return outboxRepository.recuperateExpiredLeases();
    }
}

export const outboxService = new OutboxService();