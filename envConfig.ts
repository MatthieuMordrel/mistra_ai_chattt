"server-only";
import { loadEnvConfig } from "@next/env";

const { combinedEnv } = loadEnvConfig(process.cwd());

export default combinedEnv;
