import { Router, Express } from "express";

import { authenticate } from "../middleware/AuthenticationMiddleware.js";
import { printRequestStatus } from "../middleware/RequestLogMiddleware.js";

export const registerExternalRouters = function (app: Express) {
    const router = Router();

    router.use(authenticate);
    router.use(printRequestStatus);
    // ==============================================================================

    // ==============================================================================
    app.use("/api/external", router);
}