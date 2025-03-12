# Chat Application Architecture

## Component Structure and Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   ChatInput     │────▶│  chatService    │────▶│  Mistral API    │
│   Component     │     │                 │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   ChatStore     │◀───▶│  Database       │◀────│  API Response   │
│   (Zustand)     │     │  (Server)       │     │  (Streaming)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        │
        ▼
┌─────────────────┐
│                 │
│ ChatMessageList │
│ Component       │
│                 │
└─────────────────┘
```

## Data Flow for Message Sending

1. User types a message in the `ChatInput` component and submits the form
2. `ChatInput` calls `sendMessage` from `chatService.ts`
3. `chatService.ts` performs the following actions:
   - Adds the user message to the chat store (if not already added)
   - Adds an empty assistant message to the chat store with `isStreaming: true`
   - Sets the loading and streaming flags in the chat store
   - Calls the Mistral API through the `streamMistralClient` function
   - Updates the assistant message in the chat store as tokens are received
   - Saves the messages to the database when streaming is complete
   - Updates the UI state when streaming is complete

## Key Components

### UI Components

- **ChatInput**: Handles user input and form submission
- **ChatMessageList**: Displays the list of messages
- **ChatMessageItem**: Renders individual messages with appropriate styling

### Services

- **chatService**: Handles all chat-related logic
  - `sendMessage`: Manages the entire message flow
  - `sanitizeMessages`: Formats messages for the Mistral API

### State Management

- **ChatStore**: Manages the UI state for the chat
  - Stores messages, loading states, and conversation metadata
  - Provides actions to update the UI state

### API

- **mistral-client**: Handles communication with the Mistral API
  - `streamMistralClient`: Streams responses from the Mistral API
  - `sanitizeMessages`: Formats messages for the API

### Database

- **conversation-actions**: Handles database operations for conversations
  - `createConversation`: Creates a new conversation
  - `saveMessagesAction`: Saves messages to the database

## Streaming Implementation

The streaming functionality is implemented as follows:

1. The `streamMistralClient` function in `mistral-client.ts` makes a request to the `/api/mistral/stream` endpoint
2. The endpoint forwards the request to the Mistral API with the `stream: true` parameter
3. As tokens are received from the API, they are forwarded to the client
4. The `onToken` callback in `streamMistralClient` is called for each token
5. The callback updates the assistant message in the chat store
6. The `ChatMessageItem` component displays a streaming indicator when `isStreaming` is true

This architecture ensures a clean separation of concerns:

- UI components focus on rendering and user interaction
- Services handle business logic and API communication
- State management is centralized in the chat store
- Database operations are handled by server actions
