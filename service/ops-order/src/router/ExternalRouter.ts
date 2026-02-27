import { Router, Express } from "express";

import { externalController } from "../controller/ExternalController.js";
import { authenticate } from "../middleware/AuthenticationMiddleware.js";
import { printRequestStatus } from "../middleware/RequestLogMiddleware.js";
import { createOrderSchema } from "../validation/ExternalValidator.js";
import { validate } from "../middleware/ValidationMiddleware.js";

export const initializeExternalRouters = function (app: Express) {
    const router = Router();

    router.use(authenticate);
    router.use(printRequestStatus);
    // ==============================================================================
    router.post("/orders/create", validate({ body: createOrderSchema }), externalController.createOrder);
    // ==============================================================================
    app.use("/api/external", router);
}