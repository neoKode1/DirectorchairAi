"use client";

/**
 * Next.js global error boundary — catches unhandled errors in the root layout.
 * Reports to Sentry and shows a fallback UI.
 */
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
