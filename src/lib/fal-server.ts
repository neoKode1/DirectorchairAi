import { createFalClient } from "@fal-ai/client";

// Create the fal client with server-side configuration
export const fal = createFalClient({
  proxyUrl: "/api/fal",
  credentials: process.env.FAL_KEY,
}); 