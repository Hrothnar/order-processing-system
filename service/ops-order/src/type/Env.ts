// Server
export const HOST = process.env.HOST || "127.0.0.1";
export const PORT = process.env.PORT || "3000";

// Outbox Worker
export const OUTBOX_WORKER_NAME = process.env.OUTBOX_WORKER_NAME || "ops-outbox-worker";
export const OUTBOX_WORKER_MAX_RETRIES = Number(process.env.OUTBOX_WORKER_MAX_RETRIES || 5);
export const OUTBOX_WORKER_LEASE_MIN = Number(process.env.OUTBOX_WORKER_LEASE_MIN || 2);
export const OUTBOX_WORKER_CYCLE_DELAY_MIN = Number(process.env.OUTBOX_WORKER_CYCLE_DELAY_MIN || 1);

// Database
export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://marshmallow:tasty@postgres:5432/order";

// Kafka
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "ops";
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "kafka:9092").split(", ");
export const KAFKA_PRODUCER_TOPIC_NAME = process.env.KAFKA_PRODUCER_TOPIC_NAME || "ops-order";
export const KAFKA_CONSUMER_GROUP_ID = process.env.KAFKA_CONSUMER_GROUP_ID || "ops";

// Other