import { Router, Express } from "express";

import { initializeExternalRouters } from "./ExternalRouter.js";
import { initializeUtilityRouters } from "./UtilityRouter.js";

export function registryRouters(app: Express): void {
    initializeExternalRouters(app);
    initializeUtilityRouters(app);
}