import { loadEnvConfig } from "@next/env";
import "server-only";

const { combinedEnv } = loadEnvConfig(process.cwd());

export default combinedEnv;
