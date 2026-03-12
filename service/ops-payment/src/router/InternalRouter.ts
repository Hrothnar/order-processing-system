import { Router, Express } from "express";

import { authorize } from "../middleware/AuthorizationMiddleware.js";
import { printRequestStatus } from "../middleware/RequestLogMiddleware.js";

export const registerExternalRouters = function (app: Express) {
    const router = Router();

    router.use(authorize);
    router.use(printRequestStatus);
    // ==============================================================================

    // ==============================================================================
    app.use("/api/internal", router);
}