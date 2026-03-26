import { NextFunction, Request, Response } from "express";

export function printRequestStatus(request: Request, response: Response, next: NextFunction): void {
    const timeStart = Date.now();

    response.on("finish", () => {
        const timePassedMilliseconds = `${Date.now() - timeStart}ms`;
        const resetColor: string = "\x1b[0m";
        const controllerName = response.locals.controllerName ? ` [\x1b[36m${response.locals.controllerName}${resetColor}]` : "";

        let color: string;

        if (response.statusCode >= 200 && response.statusCode < 300) {
            color = "\x1b[32m"; // Green
        }

        if (response.statusCode >= 400 && response.statusCode < 500) {
            color = "\x1b[33m"; // Yellow
        }

        if (response.statusCode >= 500) {
            color = "\x1b[31m"; // Red
        }

        const date = new Date();

        const options: any = {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        };

        const formattedDate = date.toLocaleString("hy-HY", options).replaceAll(",", "");
        const log = `${request.method} ${request.originalUrl}${controllerName} ${color + response.statusCode + resetColor} ${timePassedMilliseconds} [${formattedDate}]`;
        console.log(log);
    });

    return next();
}