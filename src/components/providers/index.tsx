"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "../ui/toaster";
import { StorageProvider } from "./storage-provider";
import { AuthProvider } from "./session-provider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <StorageProvider>
            {children}
            <Toaster />
          </StorageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Export individual providers for direct use if needed
export { AuthProvider } from "./session-provider";
export { StorageProvider } from "./storage-provider";