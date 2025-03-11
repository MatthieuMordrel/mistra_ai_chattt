import { loadEnvConfig } from "@next/env";

const { combinedEnv } = loadEnvConfig(process.cwd());

async function streamMistral() {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${combinedEnv.MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
          content:
            "Who is the best Dutch painter? Answer in one short sentence.",
        },
      ],
      response_format: { type: "text" },
    }),
  });

  if (!response.body) {
    console.error("No response body received.");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";

  process.stdout.write("Response: ");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode the chunk and add it to our buffer
    buffer += decoder.decode(value, { stream: true });

    // Process complete lines from the buffer
    const lines = buffer.split("\n");
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;

      // Handle SSE format - lines starting with "data: "
      if (line.startsWith("data: ")) {
        const jsonStr = line.substring(6); // Remove "data: " prefix

        // Handle the special "[DONE]" message that some SSE APIs use
        if (jsonStr.trim() === "[DONE]") {
          console.log("\nStream completed");
          continue;
        }

        try {
          const data = JSON.parse(jsonStr);

          // Extract and use the content if available
          if (
            data.choices &&
            data.choices[0].delta &&
            data.choices[0].delta.content
          ) {
            const content = data.choices[0].delta.content;
            fullContent += content;
            // Stream the content directly to stdout without newlines
            process.stdout.write(content);
          }
        } catch (error) {
          console.error("\nError parsing JSON:", error);
        }
      }
    }
  }

  //   console.log("\n\nFull response:", fullContent);
}

streamMistral().catch(console.error);
