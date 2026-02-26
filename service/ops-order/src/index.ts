import express from "express";

import "./config/PrismaConfig.js";
import { kafkaProducer } from "./broker/producer/KafkaProducer.js";
import { kafkaConfig } from "./config/KafkaConfig.js";
import { coolDown } from "./util/Utility.js";

const HOST = process.env.HOST;
const PORT = Number(process.env.PORT);

export const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));

app.listen(PORT, HOST, async () => {
    try {

        await coolDown(2222);

        await kafkaConfig.initializeKafka();
        await kafkaConfig.registerProducer();
        await kafkaConfig.registerConsumer();
        await kafkaConfig.subscribeConsumer(["ops-order"]);

        await kafkaProducer.send([{ key: "test", value: JSON.stringify({ payload: "some cool information!!!" }) }]);

        console.log(`[Server]\t\tStarted and running at host: [${HOST}] and port: [${PORT}].`);
        console.log("=======================================================================================================");
    } catch (error) {
        console.log(`[Server]\t\tCould not start`);
        console.error(error);
        process.exit(1);
    }
});

process.on("uncaughtException", function processUncaughtException(error: any) {
    setTimeout(() => {
        console.error(error);
        console.log("[Server]\t\t\tAn uncaught exception has been intercepted by event listener. Program is shutting down.");
        process.exit(1);
    }, 3333);
});