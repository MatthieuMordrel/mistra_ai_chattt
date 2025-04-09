import { withAuth } from "@/lib/auth/withAuth";
import { tryCatch } from "@/lib/tryCatch";
import { components } from "@/types/mistral";
import { MistralStreamRequest } from "@/types/types";
import { NextResponse } from "next/server";

/**
 * POST handler for Mistral streaming API
 * This endpoint is protected with withAuth
 */
export const POST = withAuth(async (session, req) => {
  //Parse request body
  const requestData: MistralStreamRequest = await req.json();

  // Ensure messages are provided and is an array
  if (!requestData.messages || !Array.isArray(requestData.messages)) {
    return NextResponse.json(
      { error: "Messages array is required" },
      { status: 400 },
    );
  }

  // Prepare request body
  const requestBody: components["schemas"]["ChatCompletionRequest"] = {
    //Need to define many fields because they are required by the Mistral API for some reason
    //We just use the defaults for them
    model: requestData.model || "mistral-small-latest",
    stream: true,
    messages: requestData.messages,
    response_format: { type: "text" },
    top_p: 1,
    safe_prompt: false,
    tool_choice: "none",
    presence_penalty: 0,
    frequency_penalty: 0,
    prediction: {
      type: "content",
      content: "",
    },
  };

  // Makes the request to the Mistral API
  const { data: response, error: responseError } = await tryCatch(
    fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }),
  );

  // If the fetch throws an error, return the error
  if (responseError) {
    return NextResponse.json({ error: responseError }, { status: 500 });
  }

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

  console.log("response", response);

  // Stream the response back to the client
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
