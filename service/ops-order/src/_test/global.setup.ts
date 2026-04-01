import { execSync } from "node:child_process";

import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";

export default async () => {
    const dataBase = "test_db";
    const username = "test_user";
    const password = "test_password";
    const host = "localhost";
    const port = 5432;

    let container: StartedPostgreSqlContainer = null;
    let pgURI: string = `postgresql://${username}:${password}@${host}:${port}/${dataBase}?schema=public`;

    container = await new PostgreSqlContainer("postgres:17.5-alpine3.22")
        .withHostname(host)
        .withDatabase(dataBase)
        .withUsername(username)
        .withPassword(password)
        .start();

    pgURI = container.getConnectionUri();

    execSync("npx prisma db push", { stdio: "pipe", env: { ...process.env, DATABASE_URL: pgURI } });

    const gl = global as any;
    gl.__CONTAINER = container;

    process.env.__PG_URI = pgURI;
    process.env.DATABASE_URL = pgURI;
}