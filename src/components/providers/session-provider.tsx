"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // In development mode, we still use SessionProvider but it will handle no session gracefully
  return (
    <SessionProvider
      // Don't refetch session when window is focused in development
      refetchOnWindowFocus={process.env.NODE_ENV !== "development"}
      // Allow basePath to be undefined in development
      basePath={process.env.NODE_ENV === "development" ? undefined : "/api/auth"}
    >
      {children}
    </SessionProvider>
  );
}
