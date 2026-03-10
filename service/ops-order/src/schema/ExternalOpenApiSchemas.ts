import { registry } from "../config/OpenApiRegistry.js";
import {
    CreateOrderRequestSchema,
    CreateOrderHeaderRequestSchema,
    CreateOrderResponseSchema,
    GetOrderRequestSchema,
    GetOrderResponseSchema,
    ListOrdersRequestQuerySchema,
    ListOrdersResponseSchema
} from "./ExternalSchemas.js";

registry.registerPath({
    method: "post",
    path: "/api/external/v1/orders/create",
    summary: "Creates a new order with provided items",
    tags: ["Orders"],
    request: {
        body: {
            content: {
                "application/json": { schema: CreateOrderRequestSchema },
            },
        },
        headers: CreateOrderHeaderRequestSchema
    },
    responses: {
        201: {
            description: "Created",
            content: {
                "application/json": { schema: CreateOrderResponseSchema },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/external/v1/orders/{orderId}",
    summary: "Returns an order by the provided orderId",
    tags: ["Orders"],
    request: {
        params: GetOrderRequestSchema
    },
    responses: {
        200: {
            description: "Returned",
            content: {
                "application/json": { schema: GetOrderResponseSchema },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/external/v1/orders",
    summary: "Returns all orders matching query parameters",
    tags: ["Orders"],
    request: {
        query: ListOrdersRequestQuerySchema
    },
    responses: {
        200: {
            description: "Returned",
            content: {
                "application/json": { schema: ListOrdersResponseSchema },
            },
        },
    },
});