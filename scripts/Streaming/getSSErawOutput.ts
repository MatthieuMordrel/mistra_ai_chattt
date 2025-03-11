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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    //chunk is a JSONL string of type CompletionResponseStreamChoice
    console.log(chunk); // Each JSONL chunk
  }
}

streamMistral();
