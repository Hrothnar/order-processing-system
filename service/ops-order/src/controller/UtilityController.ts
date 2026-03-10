import { Response, Request } from "express";

import { sendFailedResponse, sendSucceededResponse } from "../util/Utility.js";

export class UtilityController {

    liveness = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.liveness.name;
            const data = { isItCool: true };
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }

    readiness = async (request: Request, response: Response) => {
        try {
            response.locals.controllerName = this.readiness.name;
            const data = { isItCool: true };
            return sendSucceededResponse(response, data);
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }
}

export const utilityController = new UtilityController(); 