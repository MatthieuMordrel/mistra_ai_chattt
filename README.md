# Mistral AI Chat Application

A simple chat application powered by Mistral AI that allows users to interact with different Mistral language models.

## Features

- 🔄 Easy switching between Mistral AI models
- 🔐 Simple authentication via Google OAuth
- 💾 Chat history persistence
- 🚀 Blazing fast speed
- 🔍 Real time token counting
- 🔒 Whitelisting for private use

## Tech Stack

### Frontend

- **Next.js** - React framework for building the UI
- **Tanstack Query** - Client-side data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Shadcn UI** - Component library

### Backend

- **Next.js Route Handlers & Server Functions** - Serverless API endpoints
- **Better Auth** - Authentication and session management

### Database

- **Neon** - Serverless Postgres database
- **Drizzle ORM** - Type-safe SQL toolkit

### AI Integration

- **Mistral AI API** - Access to various Mistral language models

### Hosting Platform

- **Vercel** - Project is designed to be hosted on Vercel (could work with other hosting platforms but would require some tweaks)

## Environment Variables

To run this project, you'll need to set up the following environment variables. A template file `.env.example` is provided in the repository.

1. Copy the `.env.example` file to a new file named `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your own values in the `.env` file or/and your hosting platform's environment variables:

   - `MISTRAL_API_KEY`: Your Mistral AI API key
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: For Google OAuth authentication
   - `DATABASE_URL`: Your Neon database connection string
   - `BETTER_AUTH_SECRET`: A secret key for authentication
   - `BETTER_AUTH_URL`: The URL of the BetterAuth server
   - `WHITELISTED_EMAILS`: Comma-separated list of whitelisted email addresses

3. In Vercel, ensure to extend the maximum duration of your functions to ensure long conversations can be streamed

## TO DO:

### Issues:

### Improvements:

- Ensure navbar is correctly updated on conversation creation
- Add infinite scroll to conversations sidebar (using useInfiniteQuery?)
- Clicking on a model should close the dropdown
- Add a message for non-whitelisted users when they get redirected to login page
- Use the serverless neon database driver to stream chat message
