import express from "express";

import "./config/PrismaConfig.js";
import { sleep } from "./util/Utility.js";
import { outboxWorker } from "./worker/OutboxWorker.js";
import { registerOpenAPI } from "./config/OpenApiRegistry.js";
import { registerRouters } from "./config/RouterRegistry.js";
import { HOST, PORT } from "./type/Env.js";

export const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));

app.listen(PORT, HOST, async () => {
    try {
        registerRouters(app);
        await registerOpenAPI(app);
        
        outboxWorker.registerWorker();

        await sleep(); // just for beautiful logs

        console.log(`[Server]\t\tStarted and running at [${HOST}:${PORT}]`);
        console.log("=======================================================================================================");
    } catch (error) {
        console.log(`[Server]\t\tCould not start. Something went wrong`);
        console.error(error);
        process.exit(1);
    }
});

process.on("uncaughtException", function processUncaughtException(error: Error) {
    setTimeout(() => {
        console.error(error);
        console.log("[Server]\t\t\tAn uncaught exception has been intercepted by event listener. Program is shutting down");
        process.exit(1);
    }, 3333);
});