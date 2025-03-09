import { drizzle } from "drizzle-orm/postgres-js";

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL,
    ssl: true,
  },
});
