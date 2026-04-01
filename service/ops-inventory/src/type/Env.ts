// SERVER
export const ENV: "127.0.0.1" | "container" = "container"; 
const local = () => !((ENV as string) === "container");
export const HOST = process.env.HOST || local() ? "127.0.0.1" : "0.0.0.0";
export const PORT = Number(process.env.PORT || 3003);
export const NAME = process.env.NAME || "ops-inventory";

// KAFKA
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "ops";
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || `${local() ? ENV : "kafka"}:9092, ${local() ? ENV : "kafka"}:9094`).split(", ");

export const KAFKA_PRODUCER_TOPIC_NAME = process.env.KAFKA_PRODUCER_TOPIC_NAME || `order-status`;
export const KAFKA_PRODUCER_NAME = process.env.KAFKA_PRODUCER_NAME || `${NAME}-emitter`;

export const KAFKA_CONSUMER_TOPIC_NAME = process.env.KAFKA_CONSUMER_TOPIC_NAME || `order-central-inventory`;
export const KAFKA_CONSUMER_NAME = process.env.KAFKA_CONSUMER_NAME || `${NAME}-consumer`;
export const KAFKA_CONSUMER_GROUP_ID = process.env.KAFKA_CONSUMER_GROUP_ID || `${NAME}-group-id`;

// OTHER