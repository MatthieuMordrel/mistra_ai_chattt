// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import { isServer, QueryClient } from "@tanstack/react-query";

// Log environment on import
console.log("[PROVIDER] Module initialization, isServer:", isServer);

function makeQueryClient() {
  console.log("[PROVIDER] Creating new QueryClient, isServer:", isServer);
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * On the browwesr: make a new query client if we don't already have one, otherwise return the existing one
 * On the server: always make a new query client
 * @returns A query client instance
 */
export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    console.log(
      "[PROVIDER] getQueryClient called on server, creating new client",
    );
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    console.log(
      "[PROVIDER] getQueryClient called on client, browserQueryClient exists:",
      !!browserQueryClient,
    );
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
