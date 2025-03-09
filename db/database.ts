import combinedEnv from "@/envConfig";
import { drizzle } from "drizzle-orm/postgres-js";

export const db = drizzle({
  connection: {
    url: combinedEnv.DATABASE_URL,
    ssl: true,
  },
});
