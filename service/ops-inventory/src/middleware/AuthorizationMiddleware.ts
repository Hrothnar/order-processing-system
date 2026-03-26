import { NextFunction, Request, Response } from "express";

import { sendFailedResponse } from "../util/Utility.js";

export async function authorize(request: Request | any, response: Response, next: NextFunction): Promise<void> {
    try {

        return next();
    } catch (error) {
        sendFailedResponse(response, error);
    }
}