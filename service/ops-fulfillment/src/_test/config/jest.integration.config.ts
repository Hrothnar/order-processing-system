import type { Config } from "jest";

import base from "./jest.base.config";

const config: Config = {
    ...base,
    testMatch: ["<rootDir>/integration/**/?(*.)+(test).[jt]s?(x)"],
    setupFilesAfterEnv: ["<rootDir>/setup.ts", "<rootDir>/integration/setup.ts"],
};

delete config.projects;
delete config.collectCoverage;
delete config.coverageProvider;

export default config;