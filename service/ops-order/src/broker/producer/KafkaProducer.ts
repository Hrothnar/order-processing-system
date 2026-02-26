import { CompressionTypes, Message } from "kafkajs";

import { kafkaConfig } from "../../config/KafkaConfig.js";

const KAFKA_TOPIC_NAME = process.env.KAFKA_TOPIC_NAME || "ops-order";

const producer = await kafkaConfig.getProducer();

export class KafkaProducer {

    async send(messages: Message[]): Promise<any> {
        const result = await producer.send({
            topic: KAFKA_TOPIC_NAME,
            compression: CompressionTypes.GZIP,
            messages: messages
        });

        console.dir(result);
    }
}

export const kafkaProducer = new KafkaProducer();