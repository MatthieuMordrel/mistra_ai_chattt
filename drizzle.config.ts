import { defineConfig } from "drizzle-kit";
import combinedEnv from "./envConfig";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/*",
  dbCredentials: {
    url: combinedEnv.DATABASE_URL as string,
  },
});
