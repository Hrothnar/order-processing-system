import type { Config } from "jest";

import base from "./jest.base.config";

const config: Config = {
    ...base,
    testMatch: ["<rootDir>/e2e/**/?(*.)+(test).[jt]s?(x)"],
    setupFilesAfterEnv: ["<rootDir>/setup.ts", "<rootDir>/e2e/setup.ts"],
};

delete config.projects;
delete config.collectCoverage;
delete config.coverageProvider;

export default config;