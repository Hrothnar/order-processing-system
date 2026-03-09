import { Response, Request } from "express";

import { sendFailedResponse, sendSucceededResponse } from "../util/Utility.js";
import { orderService } from "../service/OrderService.js";
import { IDEMPOTENCY_HEADER_NAME } from "../type/Type.js";

export class ExternalController {

    createOrder = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.createOrder.name;
            const data = await orderService.createOrder(request.body, request.header(IDEMPOTENCY_HEADER_NAME));
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }

    getOrder = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.getOrder.name;
            const data = await orderService.getOrder(request.params.orderId as string);
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }

    listOrders = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.listOrders.name;
            const data = await orderService.listOrders(request.query);
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }
}

export const externalController = new ExternalController();