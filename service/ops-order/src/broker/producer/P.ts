import { Client } from "pg";
import { Kafka, CompressionTypes } from "kafkajs";
import os from "node:os";

const WORKER_ID = process.env.WORKER_ID ?? `${os.hostname()}-${process.pid}`;
const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? 50);
const POLL_MS = Number(process.env.POLL_MS ?? 500);
const LEASE_MS = Number(process.env.LEASE_MS ?? 120_000); // 2 min
const MAX_RETRIES = Number(process.env.MAX_RETRIES ?? 10);

const db = new Client({ connectionString: process.env.DATABASE_URL });
const kafka = new Kafka({ clientId: "outbox-publisher", brokers: (process.env.KAFKA_BROKERS ?? "").split(",") });
const producer = kafka.producer({
  // idempotent producer is optional; consumer dedupe is still required
  idempotent: true,
  maxInFlightRequests: 1,
});

type OutboxRow = {
  id: number;
  event_id: string;
  aggregate_id: string;
  event_name: string;
  event_version: number;
  payload: any;
  occurred_at: string;
  retry_count: number;
};

async function claimBatch(limit: number): Promise<OutboxRow[]> {
  await db.query("BEGIN");
  try {
    const { rows } = await db.query<OutboxRow>(
      `
      WITH picked AS (
        SELECT id
        FROM outbox
        WHERE status = 'PENDING'
          AND (next_attempt_at IS NULL OR next_attempt_at <= now())
        ORDER BY occurred_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT $1
      )
      UPDATE outbox o
      SET status = 'PROCESSING',
          locked_at = now(),
          locked_by = $2
      FROM picked
      WHERE o.id = picked.id
      RETURNING
        o.id, o.event_id, o.aggregate_id, o.event_name, o.event_version,
        o.payload, o.occurred_at, o.retry_count;
      `,
      [limit, WORKER_ID]
    );

    await db.query("COMMIT");
    return rows;
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
}

async function markPublished(id: number) {
  await db.query(
    `
    UPDATE outbox
    SET status = 'PUBLISHED',
        published_at = now(),
        locked_at = NULL,
        locked_by = NULL
    WHERE id = $1;
    `,
    [id]
  );
}

async function markRetry(id: number) {
  await db.query(
    `
    UPDATE outbox
    SET status = CASE WHEN retry_count + 1 >= $2 THEN 'FAILED' ELSE 'PENDING' END,
        retry_count = retry_count + 1,
        next_attempt_at = CASE
          WHEN retry_count + 1 >= $2 THEN NULL
          ELSE now() + (interval '1 second' * least(60, power(2, retry_count + 1)))
        END,
        locked_at = NULL,
        locked_by = NULL
    WHERE id = $1;
    `,
    [id, MAX_RETRIES]
  );
}

async function reapExpiredLeases() {
  await db.query(
    `
    UPDATE outbox
    SET status = 'PENDING',
        locked_at = NULL,
        locked_by = NULL
    WHERE status = 'PROCESSING'
      AND locked_at IS NOT NULL
      AND locked_at < now() - (make_interval(secs => $1));
    `,
    [Math.floor(LEASE_MS / 1000)]
  );
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await db.connect();
  await producer.connect();

  while (true) {
    // recovery: release stuck rows if a worker died mid-processing
    await reapExpiredLeases();

    const batch = await claimBatch(BATCH_SIZE);
    if (batch.length === 0) {
      await sleep(POLL_MS);
      continue;
    }

    for (const row of batch) {
      try {
        // Build envelope you stored in payload (recommended) OR build here
        // Here we assume payload already contains full envelope.
        const envelope = row.payload;

        await producer.send({
          topic: process.env.KAFKA_TOPIC ?? "orders.events",
          compression: CompressionTypes.GZIP,
          messages: [
            {
              key: row.aggregate_id, // orderId partition key
              value: JSON.stringify(envelope),
              headers: {
                "event-id": row.event_id,
                "event-name": row.event_name,
                "event-version": String(row.event_version),
              },
            },
          ],
        });

        await markPublished(row.id);
      } catch (e) {
        // If publish may have succeeded but DB update failed, duplicates can happen.
        // That’s okay if consumers dedupe by eventId.
        await markRetry(row.id);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});