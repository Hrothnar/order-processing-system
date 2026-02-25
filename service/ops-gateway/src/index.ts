import express from "express";

const HOST = process.env.HOST;
const PORT = parseInt(process.env.PORT);

export const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));

app.listen(PORT, HOST, async () => {
    try {



        console.log(`[Server]\t\tStarted and running at host: [${HOST}] and port: [${PORT}].`);
    } catch (error) {
        console.error(`[Server]\t\tThe server could not start with error: ${error.message}`);
        process.exit(1);
    }
});

process.on("uncaughtException", function processUncaughtException(error: any) {
    setTimeout(() => {
        console.error(error);
        console.log("[Server]\t\tAn uncaught exception has been intercepted by event listener. Program is shutting down.");
        process.exit(1);
    }, 3333);
});