import { ModelService } from "@/db/services/model-service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for fetching all active models
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch active models from the database
    const models = await ModelService.getActiveModels();

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 },
    );
  }
}
