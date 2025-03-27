import { DAL } from "@/db/dal";
import { tryCatch } from "@/lib/tryCatch";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching all active models
 */
export async function GET(req: NextRequest) {
  // Fetch active models from the database
  const { data: models, error } = await tryCatch(
    DAL.model.queries.getActiveModels(),
  );

  if (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 },
    );
  }

  return NextResponse.json({ models });
}
