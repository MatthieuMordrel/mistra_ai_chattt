import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db/database";
import * as schema from "../db/schema/auth-schema";

export const auth = betterAuth({
  appName: "Mistral AI Chat",
  baseUrl: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: process.env.BETTER_AUTH_URL + "/api/auth/callback/google",
    },
  },
  plugins: [nextCookies()],
});
