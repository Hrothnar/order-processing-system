import { Router, Express } from "express";

import { printRequestStatus } from "../middleware/RequestLogMiddleware.js";

export const initializeUtilityRouters = function (app: Express) {
    const router = Router();

    router.use(printRequestStatus);
    // ==============================================================================

    // ==============================================================================
    app.use("/api/utility", router);
}