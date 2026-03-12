// SERVER
export const ENV: "127.0.0.1" | "container" = "127.0.0.1"; const local = () => !((ENV as string) === "container");
export const HOST = process.env.HOST || "127.0.0.1";
export const PORT = Number(process.env.PORT || 3000);
export const NAME = process.env.NAME || "ops-order";


// KAFKA
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "ops";
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || `${local() ? ENV : "kafka"}:9092, ${local() ? ENV : "kafka"}:9094`).split(", ");
export const KAFKA_PRODUCER_TOPIC_NAME = process.env.KAFKA_PRODUCER_TOPIC_NAME || `${NAME}-central`;
export const KAFKA_CONSUMER_GROUP_ID = process.env.KAFKA_CONSUMER_GROUP_ID || `${NAME}-status`;
export const KAFKA_PRODUCER_NAME = process.env.KAFKA_CONSUMER_NAME || `${NAME}-order-emitter`;
export const KAFKA_CONSUMER_NAME = process.env.KAFKA_CONSUMER_NAME || `${NAME}-order-consumer`;

// OTHER