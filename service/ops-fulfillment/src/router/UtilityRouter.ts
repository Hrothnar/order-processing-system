import { Router, Express } from "express";

import { utilityController } from "../controller/UtilityController.js";

export const registerUtilityRouters = function (app: Express) {
    const router = Router();
    // ==============================================================================
    router.get("/liveness", utilityController.liveness);
    router.get("/readiness", utilityController.readiness);
    // ==============================================================================
    app.use("/api/utility", router);
}