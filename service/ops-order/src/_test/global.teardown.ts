import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";

export default async () => {
    const gl = global as any;
    
    if (gl.__CONTAINER) {
        const container = gl.__CONTAINER as StartedPostgreSqlContainer;
        await container.stop();
    }
}