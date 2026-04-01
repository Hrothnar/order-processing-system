import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

import { sendFailedResponse } from "../util/Utility.js";

/**
 * @deprecated Express 5 does not allow assign "query" which leads to unwanted workarounds
 * @param schemas 
 * @returns 
 */
export const validate = (schemas: Record<string, ZodObject<any>>) => {
    return (request: Request, response: Response, next: NextFunction) => {
        try {
            for (const [key, schema] of Object.entries(schemas)) {
                const parsed = schema.parse(request[key as keyof Request]);

                if (key === "query") {
                    Object.assign(request.query, parsed);
                } else if (key === "params") {
                    Object.assign(request.params, parsed);
                } else if (key === "body") {
                    Object.assign(request.body, parsed);
                } else {
                    (request as any)[key] = parsed;
                }
            }

            next();
        } catch (error) {
            return sendFailedResponse(response, error);
        }
    }
}