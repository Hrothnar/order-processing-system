import { Consumer, Kafka, logLevel, Producer } from "kafkajs";

import { kafkaConsumer } from "../broker/consumer/KafkaConsumer.js";
import { sleep } from "../util/Utility.js";
import { KAFKA_BROKERS, KAFKA_CLIENT_ID, KAFKA_CONSUMER_GROUP_ID } from "../type/Env.js";

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
    }

    async registerProducer() {
        this.producer = this.kafka.producer({

        });

        await this.producer.connect();

        console.log("[Kafka]\t\tProducer connection is established");
    }

    async registerConsumer() {
        this.consumer = this.kafka.consumer({
            groupId: KAFKA_CONSUMER_GROUP_ID
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

                await sleep(128);
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