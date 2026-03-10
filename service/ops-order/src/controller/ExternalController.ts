import { Response, Request } from "express";

import { sendFailedResponse, sendSucceededResponse } from "../util/Utility.js";
import { orderService } from "../service/OrderService.js";
import { CreateOrderHeaderRequestSchema, CreateOrderRequestSchema, GetOrderRequestSchema, ListOrdersRequestQuerySchema } from "../schema/ExternalSchemas.js";
import { IDEMPOTENCY_HEADER_NAME } from "../type/Type.js";

export class ExternalController {

    createOrder = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.createOrder.name;

            const body = CreateOrderRequestSchema.parse(request.body);
            const idempotencyKey = CreateOrderHeaderRequestSchema.parse(request.headers)[IDEMPOTENCY_HEADER_NAME];

            const data = await orderService.createOrder(body, idempotencyKey);
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }

    getOrder = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.getOrder.name;

            const orderId = GetOrderRequestSchema.parse(request.params).orderId;

            const data = await orderService.getOrder(orderId);
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }

    listOrders = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.listOrders.name;

            const query = ListOrdersRequestQuerySchema.parse(request.query);

            const data = await orderService.listOrders(query);
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }
}

export const externalController = new ExternalController();