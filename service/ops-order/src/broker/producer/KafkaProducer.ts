import { CompressionTypes, Message } from "kafkajs";

import { kafkaConfig } from "../../config/KafkaConfig.js";
import { KAFKA_PRODUCER_TOPIC_NAME } from "../../type/Env.js";

const producer = await kafkaConfig.getProducer();

export class KafkaProducer {

    async send(messages: Message[]): Promise<any> {
        const result = await producer.send({
            topic: KAFKA_PRODUCER_TOPIC_NAME,
            compression: CompressionTypes.GZIP,
            messages: messages
        });

        console.dir(result);
    }
}

export const kafkaProducer = new KafkaProducer();