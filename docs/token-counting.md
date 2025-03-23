# Token Counting Implementation

This document explains how token counting works in our application.

## Overview

Token counting is used to:

1. Show users how many tokens their conversation is using
2. Provide real-time updates during message streaming
3. Help users understand the conversation size relative to context limits

## Implementation Details

We use a lightweight, pure JavaScript implementation for token counting that provides reasonable estimates without relying on any server calls or binary dependencies. This avoids platform-specific compatibility issues and simplifies the architecture.

### Client-Side Implementation

The tokenizer implementation (`lib/tokenizer.ts`):

- Uses Unicode-aware regex patterns to handle text correctly
- Provides consistent token counting throughout the application
- Works entirely in the browser with no server dependencies
- Has fallback mechanisms for older browsers with limited regex support

### Core Functions

The tokenizer provides several key functions:

1. `simpleTokenize()` - Splits text into tokens using Unicode-aware regex
2. `countTokens()` - Counts tokens in a string
3. `countMessageTokens()` - Counts tokens in an array of messages, accounting for message formatting
4. `estimateTokenCount()` - Synchronous version for immediate token estimates during streaming

### Token Count Display

The token counter is displayed in both:

1. The chat header - showing the total conversation token count
2. Below the input field - updating in real-time during streaming

## Token Estimation vs. Exact Counting

Our implementation provides estimates that are reasonably close to the tokenization used by models like Mistral AI. However, it's important to note:

- Exact tokenization varies between different AI models
- Our estimates might differ slightly from what the model actually uses
- The counts should be treated as approximate guidance rather than exact measures

## Advantages of Client-Side Implementation

By using a pure client-side implementation:

- No server-side API calls required (reduced latency)
- Works offline and during network issues
- Simplified codebase with fewer dependencies
- Consistent token counting across all parts of the application
