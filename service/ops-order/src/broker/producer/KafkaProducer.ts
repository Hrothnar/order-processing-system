import { CompressionTypes, Message, RecordMetadata } from "kafkajs";

import { kafkaConfig } from "../../config/KafkaConfig.js";
import { EventEmit } from "../../type/Type.js";

const producer = await kafkaConfig.getProducer();

export class KafkaProducer {

    async send(data: EventEmit, topic: string): Promise<RecordMetadata[]> {
        const messages: Message[] = [{
            key: "data",
            value: JSON.stringify(data),
            timestamp: Date.now().toString()
        }];

        const result = await producer.send({
            topic: topic,
            compression: CompressionTypes.GZIP,
            messages: messages
        });

        return result;
    }
}

export const kafkaProducer = new KafkaProducer();