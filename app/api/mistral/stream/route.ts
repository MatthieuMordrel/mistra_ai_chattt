import { components } from "@/types/mistral";
import { NextRequest, NextResponse } from "next/server";

/**
 * Message type for Mistral API
 */
type MistralMessage =
  | components["schemas"]["SystemMessage"]
  | components["schemas"]["UserMessage"]
  | components["schemas"]["AssistantMessage"]
  | components["schemas"]["ToolMessage"];

/**
 * Request body interface for the Mistral streaming API
 */
interface MistralStreamRequest {
  model?: string;
  messages: MistralMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: components["schemas"]["ResponseFormat"];
}

/**
 * POST handler for Mistral streaming API
 * This endpoint is protected with Better Auth
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const requestData: MistralStreamRequest = await req.json();

    // Validate required fields
    if (!requestData.messages || !Array.isArray(requestData.messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    // Prepare request to Mistral API
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: requestData.model || "mistral-small-latest",
        stream: true,
        messages: requestData.messages,
        temperature: requestData.temperature,
        max_tokens: requestData.maxTokens,
        response_format: requestData.responseFormat || { type: "text" },
      }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Mistral API request failed: ${response.status} - ${errorText}`,
        },
        { status: response.status },
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in Mistral streaming API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
