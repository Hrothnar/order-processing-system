import { PrismaClient } from "@prisma/client";

import { prisma } from "../../config/PrismaConfig";
import { intercept } from "../util";

export let prismaClient: PrismaClient = null;

beforeAll(async () => {
    prismaClient = new PrismaClient({ datasourceUrl: process.env.__PG_URI, transactionOptions: { maxWait: 11111, timeout: 11111 } });
    await prismaClient.$connect();

    exports.prisma = prismaClient;
});

beforeEach(async () => {
    intercept();
});

afterEach(async () => {
    await prismaClient.$executeRawUnsafe(`TRUNCATE TABLE "idempotency", "order", "order_item", "outbox", "processed_event" RESTART IDENTITY CASCADE;`);
});

afterAll(async () => {
    await prismaClient.$disconnect();
    await prisma.$disconnect();
});