import { loadEnvConfig } from "@next/env";
import { components } from "../../types/mistral";

const { combinedEnv } = loadEnvConfig(process.cwd());

async function streamMistral() {
  // Define the request body with proper typing
  const requestBody: components["schemas"]["ChatCompletionRequest"] = {
    model: "mistral-small-latest",
    stream: true,
    messages: [
      {
        role: "user",
        content:
          "Who is the best French painter? Answer in one short sentence.",
      },
      {
        role: "user",
        content: "Who is the best Dutch painter? Answer in one short sentence.",
      },
    ],
    response_format: { type: "text" },
    top_p: 1,
    safe_prompt: false,
    tool_choice: "auto",
    presence_penalty: 0,
    frequency_penalty: 0,
    prediction: {
      type: "content",
      content: "",
    },
  };

  //The response is a stream of SSE messages
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${combinedEnv.MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.body) {
    console.error("No response body received.");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // Types for the streaming response data
  type StreamChunk = components["schemas"]["CompletionChunk"];
  type Usage = components["schemas"]["UsageInfo"]; //optional, only logged for the last chunk
  type StreamChoice = components["schemas"]["CompletionResponseStreamChoice"];
  type DeltaMessage = components["schemas"]["DeltaMessage"];

  // Define the server-sent events format
  type SSEMessage = string; // Raw SSE message with "data: " prefix
  type JSONLStreamChunk = string; // JSON string that when parsed becomes a StreamChunk

  // Helper function to parse a chunk if needed (doesn't change the original output)
  function parseStreamChunk(jsonlChunk: JSONLStreamChunk): StreamChunk | null {
    try {
      return JSON.parse(jsonlChunk) as StreamChunk;
    } catch (e) {
      return null;
    }
  }

  while (true) {
    //Read the stream, when the stream is done, the reader.read() will return { done: true }
    const { done, value } = await reader.read();
    if (done) break;

    //Decode the stream into a string
    const chunk = decoder.decode(value, { stream: true });
    // chunk is of type SSEMessage containing JSONLStreamChunk data
    // The format is "data: " + JSON.stringify(StreamChunk)
    console.log(chunk); // Original output behavior preserved
  }
}
// Example of how you could access the typed data (not executed):
/*
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        if (line === 'data: [DONE]') {
          // End of stream marker
          break;
        }
        
        // Extract the JSON part (after 'data: ')
        const jsonlChunk: JSONLStreamChunk = line.substring(6);
        
        // Parse into typed object if needed
        const typedChunk = parseStreamChunk(jsonlChunk);
        if (typedChunk) {
          // Now you have access to the strongly typed data
          // typedChunk.id, typedChunk.choices, etc.
        }
      }
    }
    */

streamMistral();
