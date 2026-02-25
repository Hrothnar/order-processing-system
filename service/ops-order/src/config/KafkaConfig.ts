import { Consumer, Kafka, logLevel, Producer } from "kafkajs";

import { kafkaConsumer } from "../broker/consumer/KafkaConsumer.js";

const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || "order-processing";

export class KafkaConfig {

    private kafka: Kafka = null;
    private producer: Producer = null;
    private consumer: Consumer = null;

    async initialize() {
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

        await this.registerProducer();
        await this.registerConsumer();
    }


    private async registerProducer() {
        this.producer = this.kafka.producer({

        });

        await this.producer.connect();
        console.log("[Kafka]\t\tProducer connection is established");
    }

    private async registerConsumer() {
        this.consumer = this.kafka.consumer({
            groupId: KAFKA_GROUP_ID
        });
        
        await this.consumer.connect();
        console.log("[Kafka]\t\tConsumer connection is established");

        await this.consumer.subscribe({ topics: ["ops-order"] });

        await this.consumer.run({
            eachMessage: kafkaConsumer.handleMessage
        });

        console.log("[Kafka]\t\tConsumer is configured and ready to listen");
    }

    async getProducer() {
        if (!this.producer) {
            await this.initialize();
            console.log("NO PRODUCER");
        }

        return this.producer;
    }

    async getConsumer() {
         if (!this.consumer) {
            await this.initialize();
            console.log("NO CONSUMER");
        }
        return this.consumer;
    }
}

export const kafkaConfig = new KafkaConfig();