import { Router, Express } from "express";

import { externalController } from "../controller/ExternalController.js";
import { authenticate } from "../middleware/AuthenticationMiddleware.js";
import { printRequestStatus } from "../middleware/RequestLogMiddleware.js";

export const registerExternalRouters = function (app: Express) {
    const router = Router();

    router.use(authenticate);
    router.use(printRequestStatus);
    // ==============================================================================
    router.post("/v1/orders/create", externalController.createOrder);
    router.get("/v1/orders/:orderId", externalController.getOrder);
    router.get("/v1/orders", externalController.listOrders);
    // ==============================================================================
    app.use("/api/external", router);
}