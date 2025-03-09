import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db/database";
import * as schema from "../db/schema/auth-schema";

export const auth = betterAuth({
  appName: "Mistral AI Chat",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001",
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: "http://localhost:3001/api/auth/callback/google",
    },
  },
  plugins: [nextCookies()],
});
