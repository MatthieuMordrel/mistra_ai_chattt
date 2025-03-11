import { fileURLToPath } from "url";
import { streamMistral } from "./mistral";

/**
 * Example demonstrating how to use the streamMistral function
 */
async function main() {
  console.log("Starting Mistral API stream example...\n");

  try {
    // Simple example with default settings
    console.log("Example 1: Basic usage");
    console.log("Response: ");
    await streamMistral({
      messages: [
        {
          role: "user",
          content:
            "Who is the best French painter? Answer in one short sentence.",
        },
      ],
      onComplete: () => console.log("\n"),
    });

    // Example with multiple messages and a system message
    console.log("\nExample 2: With system message and temperature");
    console.log("Response: ");
    await streamMistral({
      model: "mistral-large-latest", // Using a more powerful model
      temperature: 0.7, // Higher temperature for more creative responses
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant with expertise in art history.",
        },
        {
          role: "user",
          content: "Compare the styles of Monet and Van Gogh in 2-3 sentences.",
        },
      ],
      onComplete: () => console.log("\n"),
    });

    // Example with custom callbacks
    console.log("\nExample 3: With custom callbacks");
    console.log("Response (word by word): ");

    let wordBuffer = "";
    let wordCount = 0;

    await streamMistral({
      messages: [
        {
          role: "user",
          content: "What are the top 3 tourist attractions in Paris?",
        },
      ],
      // Custom token handler that prints words instead of characters
      onToken: (token) => {
        wordBuffer += token;

        // When we encounter a space, print the word
        if (token.includes(" ")) {
          const words = wordBuffer.split(" ");
          // Last element might be incomplete, keep it in the buffer
          wordBuffer = words.pop() || "";

          // Print each complete word
          for (const word of words) {
            if (word) {
              wordCount++;
              process.stdout.write(`[${wordCount}:${word}] `);
            }
          }
        }
      },
      onComplete: (fullText) => {
        // Print any remaining text in the buffer
        if (wordBuffer) {
          wordCount++;
          process.stdout.write(`[${wordCount}:${wordBuffer}]`);
        }
        console.log("\n\nTotal words:", wordCount);
      },
      onError: (error) => {
        console.error("Custom error handler:", error.message);
      },
    });

    console.log("\nAll examples completed!");
  } catch (error) {
    console.error("Error in example:", error);
  }
}

// Run the example if this file is executed directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  main().catch(console.error);
}
