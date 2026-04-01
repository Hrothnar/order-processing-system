import { Response, Request, NextFunction } from "express";

export function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function sleep<T>(ms: number = 512): Promise<T> {
    return await new Promise((resolve) => setTimeout(resolve, ms));
}

export function sendFailedResponse(response: Response, error: Error | any): any {
    let statusCode = 500;

    if (typeof error?.status === "number") statusCode = error.status;
    if (typeof error?.code === "number") statusCode = error.code;
    if (typeof error?.statusCode === "number") statusCode = error.code;

    error.statusCode = statusCode;
    error.details = error?.message || "An internal service error has occurred";

    console.log(error);

    return response.status(statusCode).json({ error: error });
}

export function sendSucceededResponse(response: Response, data?: any, code?: number): any {
    code = code ?? 200;

    if (!data || Object.keys(data).length === 0) {
        data = { status: "success" };
    }

    return response.status(code).json(data);
}