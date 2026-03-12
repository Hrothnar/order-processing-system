import { CompressionTypes, Message, RecordMetadata } from "kafkajs";

import { kafkaConfig } from "../../config/KafkaConfig.js";
import { KAFKA_PRODUCER_TOPIC_NAME } from "../../type/Env.js";
import { EventEmit } from "../../type/Type.js";

const producer = await kafkaConfig.getProducer();

export class KafkaProducer {

    async send(data: EventEmit): Promise<RecordMetadata[]> {
        const messages: Message[] = [{
            key: "data",
            value: JSON.stringify(data),
            timestamp: Date.now().toString()
        }];

        const result = await producer.send({
            topic: KAFKA_PRODUCER_TOPIC_NAME,
            compression: CompressionTypes.GZIP,
            messages: messages
        });

        return result;
    }
}

export const kafkaProducer = new KafkaProducer();