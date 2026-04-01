import { prisma } from "../../config/PrismaConfig";
import { intercept } from "../util";

beforeAll(async () => {

});

beforeEach(async () => {
    intercept();
});

afterEach(async () => {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "idempotency", "order", "order_item", "outbox", "processed_event" RESTART IDENTITY CASCADE;`);
});

afterAll(async () => {
    await prisma.$disconnect();
});