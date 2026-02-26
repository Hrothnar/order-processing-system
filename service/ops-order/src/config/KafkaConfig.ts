import { Consumer, Kafka, logLevel, Producer } from "kafkajs";

import { kafkaConsumer } from "../broker/consumer/KafkaConsumer.js";
import { coolDown } from "../util/Utility.js";

export class KafkaConfig {

    KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || "order-processing";

    private kafka: Kafka = null;
    private producer: Producer = null;
    private consumer: Consumer = null;

    async initializeKafka() {
        if (this.kafka) {
            return;
        }

        this.kafka = new Kafka({
            clientId: "ops-order",
            brokers: ["kafka:9092"],
            retry: {
                restartOnFailure: async (error: Error) => true
            },
            logLevel: logLevel.ERROR,
        });
    }

    async registerProducer() {
        this.producer = this.kafka.producer({

        });

        await this.producer.connect();

        console.log("[Kafka]\t\tProducer connection is established");
    }

    async registerConsumer() {
        this.consumer = this.kafka.consumer({
            groupId: this.KAFKA_GROUP_ID
        });

        await this.consumer.connect();

        console.log("[Kafka]\t\tConsumer connection is established");
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

                await coolDown(128);
            }
        }

        await this.consumer.run({
            eachMessage: kafkaConsumer.handleMessage
        });

        console.log(`[Kafka]\t\tSubscribed to ${topics} successfully`);
    }

    async getProducer() {
        if (!this.producer) {
            await this.initializeKafka();
            await this.registerProducer();
        }

        return this.producer;
    }

    async getConsumer() {
        if (!this.consumer) {
            await this.initializeKafka();
            await this.registerConsumer();
        }

        return this.consumer;
    }

    async getKafka() {
        if (!this.kafka) {
            await this.initializeKafka();
        }

        return this.kafka;
    }
}

export const kafkaConfig = new KafkaConfig();