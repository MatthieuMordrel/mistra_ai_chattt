import { components } from "@/types/mistral";

export interface BasicMessage {
  role: string; // Accept any string for role to be compatible with database Message type
  content: string;
  [key: string]: any; // Allow for additional properties
}
// Chunk type
export type StreamChunk = components["schemas"]["CompletionChunk"];

// Within chunk, usage info type
type UsageInfo = components["schemas"]["UsageInfo"];

// Within chunk, choice type
type StreamChoice = components["schemas"]["CompletionResponseStreamChoice"];

// Within choice, delta message type
type DeltaMessage = components["schemas"]["DeltaMessage"];
