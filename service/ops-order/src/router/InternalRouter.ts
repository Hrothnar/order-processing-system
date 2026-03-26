import { Router, Express } from "express";

import { printRequestStatus } from "../middleware/RequestLogMiddleware.js";
import { authorize } from "../middleware/AuthorizationMiddleware.js";

export const registerExternalRouters = function (app: Express) {
    const router = Router();

    router.use(authorize);
    router.use(printRequestStatus);
    // ==============================================================================

    // ==============================================================================
    app.use("/api/internal", router);
}