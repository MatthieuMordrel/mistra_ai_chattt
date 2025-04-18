import { components } from "@/types/mistral";
import { extractContentFromChunk } from "./extractFromChunk";
import { parseSSELine } from "./parseSSELine";
import { sanitizeMessages } from "./sanitizeMessage";
import { BasicMessage, StreamChunk } from "./types";

/**
 * Stream responses from the Mistral AI API with minimal boilerplate.
 * Utilizes TextDecoderStream for native streaming text decoding.
 */
export async function streamMistralClient({
  model = "mistral-small-latest",
  messages,
  temperature,
  maxTokens,
  responseFormat = { type: "text" },
  onToken = () => {},
  onComplete = () => {},
  onError = console.error,
  onChunk,
}: StreamMistralClientOptions): Promise<string> {
  try {
    // Sanitize messages to meet API requirements
    const sanitized = sanitizeMessages(messages);
    const res = await fetch("/api/mistral/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: sanitized,
        temperature,
        maxTokens,
        responseFormat,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed (${res.status}): ${text}`);
    }
    if (!res.body) throw new Error("Empty response body");

    // Pipe through a TextDecoderStream for automatic UTF-8 decoding
    const textStream = res.body.pipeThrough(new TextDecoderStream());
    const reader = textStream.getReader();
    let fullText = "";

    // Async generator: read decoded strings, split into SSE lines, parse
    async function* parseStream(reader: ReadableStreamDefaultReader<string>) {
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;

        const lines = buffer.split("\n");
        buffer = lines.pop()!; // Keep last incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const chunk = parseSSELine(trimmed);
          if (chunk) yield chunk;
        }
      }

      // Flush any remaining data
      if (buffer.trim()) {
        const last = parseSSELine(buffer);
        if (last) yield last;
      }
    }

    // Iterate parsed SSE chunks
    for await (const chunk of parseStream(reader)) {
      onChunk?.(chunk);
      const content = extractContentFromChunk(chunk);
      if (content) {
        fullText += content;
        onToken(content);
      }
    }

    onComplete(fullText);
    return fullText;
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
    throw err;
  }
}

/**
 * Options for the streamMistralClient function
 */
export interface StreamMistralClientOptions {
  model?: string;
  messages: BasicMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: components["schemas"]["ResponseFormat"];
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  onChunk?: (chunk: StreamChunk) => void;
}
