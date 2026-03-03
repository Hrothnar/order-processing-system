import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

import { sendFailedResponse } from "../util/Utility.js";
import { Exception } from "../exception/Exception.js";

export const validate = (schemas: { [key: string]: ZodObject }): any => {
    return (request: Request | any, response: Response, next: NextFunction): void => {
        for (const [key, schema] of Object.entries(schemas)) {
            try {
                const result = schema.parse(request[key]);
                request[key] = result;
            } catch (error) {
                if (error instanceof ZodError) {
                    return sendFailedResponse(response, new Exception(error.message, 404));
                }

                return sendFailedResponse(response, error);
            }
        }

        return next();
    };
}