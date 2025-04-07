import { NextRequest, NextResponse } from "next/server";
import { tryCatch } from "../tryCatch";
import { HttpError } from "./errors";
import { cachedValidateServerSession } from "./validateSession";

/**
 * Higher-Order Function that wraps API route handlers with authentication
 *
 * @param handler Function that receives the authenticated session and request
 * @returns Route handler function with authentication built-in
 */
export function withAuth<T>(
  handler: (
    session: NonNullable<
      Awaited<ReturnType<typeof cachedValidateServerSession>>["session"]
    >,
    req: NextRequest,
    context: { params: Promise<Record<string, string>> },
  ) => Promise<T>,
) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> },
  ): Promise<T> => {
    console.log("withAuth");
    const result = await tryCatch(cachedValidateServerSession());
    if (result.error) {
      if (result.error instanceof HttpError) {
        return NextResponse.json(
          { error: result.error.message },
          { status: result.error.status },
        ) as unknown as T;
      }

      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 },
      ) as unknown as T;
    }

    // We know session is not null because validateServerSession would have thrown
    const { session } = result.data;

    return handler(session!, req, context);
  };
}
