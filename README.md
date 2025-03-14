# Mistral AI Chat Application

A simple chat application powered by Mistral AI that allows users to interact with different Mistral language models.

## Features

- 🤖 Chat with different Mistral AI models
- 🔄 Easy switching between Mistral AI models
- 🔐 Simple authentication via Google OAuth
- 💾 Chat history persistence

## Tech Stack

### Frontend

- **Next.js** - React framework for building the UI
- **React Query** - Client-side data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework

### Backend

- **Next.js Route Handlers & Server Functions** - Serverless API endpoints
- **Vercel Data Cache** - Server-side caching for improved performance
- **Better Auth** - Authentication and session management

### Database

- **Neon** - Serverless Postgres database
- **Drizzle ORM** - Type-safe SQL toolkit

### AI Integration

- **Mistral AI API** - Access to various Mistral language models

## Environment Variables

To run this project, you'll need to set up the following environment variables. A template file `.env.example` is provided in the repository.

1. Copy the `.env.example` file to a new file named `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your own values in the `.env` file:
   - `MISTRAL_API_KEY`: Your Mistral AI API key
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: For Google OAuth authentication
   - `DATABASE_URL`: Your Neon database connection string
   - `BETTER_AUTH_SECRET`: A secret key for authentication
   - `BETTER_AUTH_URL`: The URL of the BetterAuth server

## TO DO:

### Issues:

- Conversations titles are fetched twice on initial load
- `dashboard/page.tsx` is displayed when loading `id/page`
- Conversations messages are not cached (and so dynamic chat routes are not cached and needs to be fetched from the server on every load)
- Previous messages apears when navigating to convefsation and starting new conversation from dashboard

### Improvements:

- Make a soft navigate to the correct conversation ID after sending message (allows the navbar to update)
- Add suspense boundaries to all pages to make ui instant
