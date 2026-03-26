import { Router, Express } from "express";

import { registerExternalRouters } from "../router/ExternalRouter.js";
import { registerUtilityRouters } from "../router/UtilityRouter.js";

export function registerRouters(app: Express): void {
    registerExternalRouters(app);
    registerUtilityRouters(app);
    registerUtilityRouters(app);
}