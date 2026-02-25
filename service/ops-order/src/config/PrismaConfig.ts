import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
    return new PrismaClient({
        log: [
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "query" }
        ]
    });
}

const globalForPrisma = globalThis as any as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// export type PrismaTransactionalClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]; /TODO do I need it?

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

prisma.$connect()
    .then(() => {
        console.log("[PostgreSQL]\t\tConnection for server has been established.");
        console.log("=======================================================================================================");
    }).catch((error: any) => {
        console.error(error);
    });