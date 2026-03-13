import { Router, Express } from "express";
import swaggerUi from "swagger-ui-express";

import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { OpenAPIObjectConfig } from "@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator";

import { HOST, PORT } from "../type/Env.js";

export const registry = new OpenAPIRegistry();

export async function registerOpenAPI(app: Express): Promise<void> {
    await import("../schema/ExternalOpenApiSchemas.js"); // TODO think of something better
    await import("../schema/InternalOpenApiSchemas.js"); // TODO think of something better
    await import("../schema/UtilityOpenApiSchemas.js");  // TODO think of something better

    const config: OpenAPIObjectConfig = {
        openapi: "3.0.3",
        info: { title: "OPS API", version: "1.0.0" },
    };

    const openapiDoc = new OpenApiGeneratorV3(registry.definitions).generateDocument(config);

    app.get("/docs.json", (request, response) => response.json(openapiDoc));
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));

    console.log(`[OpenAPI] --- OpenAPI documentation [http://${HOST}:${PORT}/docs.json] and Swagger UI [http://${HOST}:${PORT}/docs] are served`);
}