import { Response, Request } from "express";

import { sendFailedResponse, sendSucceededResponse } from "../util/Utility.js";
import { orderService } from "../service/OrderService.js";

export class ExternalController {

    createOrder = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.createOrder.name;
            const data = await orderService.createOrder(request.body);
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }
}

export const externalController = new ExternalController();