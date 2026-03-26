import { resolve } from "node:path";
import { spawn } from "node:child_process";

const [testType, fileName] = process.argv.slice(2);

if (!testType || !fileName) {
    console.error("Usage: npm run test:one -- <testType> <fileName>");
    process.exit(1);
}

const configPath = resolve(`./src/_test/config/jest.${testType}.config.ts`);
const testFilePath = resolve(`./src/_test/${testType}/${fileName}.test.ts`);

spawn("jest", ["--config", configPath, testFilePath], { stdio: "inherit", shell: true });