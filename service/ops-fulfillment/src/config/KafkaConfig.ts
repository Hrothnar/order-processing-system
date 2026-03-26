import { Consumer, Kafka, logLevel, Producer } from "kafkajs";

import { kafkaConsumer } from "../broker/consumer/KafkaConsumer.js";
import { sleep } from "../util/Utility.js";
import { KAFKA_BROKERS, KAFKA_CLIENT_ID, KAFKA_CONSUMER_GROUP_ID, KAFKA_CONSUMER_TOPIC_NAME } from "../type/Env.js";

export class KafkaConfig {

    private kafka: Kafka = null;
    private producer: Producer = null;
    private consumer: Consumer = null;

    async initializeKafka() {
        if (this.kafka) {
            return;
        }

        this.kafka = new Kafka({
            clientId: KAFKA_CLIENT_ID,
            brokers: KAFKA_BROKERS,
            retry: {
                restartOnFailure: async (error: Error) => true
            },
            logLevel: logLevel.ERROR,
        });

        await this.registerProducer();
        await this.registerConsumer();
    }

    async registerProducer() {
        this.producer = this.kafka.producer({
            
        });

        await this.producer.connect();

        console.log("[Kafka] --- Kafka producer connection is established");
    }

    async registerConsumer() {
        this.consumer = this.kafka.consumer({
            groupId: KAFKA_CONSUMER_GROUP_ID
        });

        await this.consumer.connect();

        await this.subscribeConsumer([KAFKA_CONSUMER_TOPIC_NAME]);

        console.log("[Kafka] --- Kafka consumer connection is established");
    }

    async subscribeConsumer(topics: string[]) {
        let attempts = 5;

        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                await this.consumer.subscribe({ topics: topics });
                break;
            } catch (error) {
                if (attempt === attempts) {
                    throw error;
                }

                await sleep(128);
            }
        }

        await this.consumer.run({
            eachMessage: kafkaConsumer.handleMessage
        });

        console.log(`[Kafka] --- Kafka consumer subscribed to [${topics}] successfully`);
    }

    async getProducer() {
        if (!this.kafka) {
            await this.initializeKafka();
        }

        return this.producer;
    }
}

export const kafkaConfig = new KafkaConfig();