'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-lg border border-border p-6 text-center">
        <div className="text-destructive text-6xl mb-4">🚨</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong!
        </h1>
        <p className="text-muted-foreground mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="space-y-2">
          <Button
            onClick={reset}
            className="w-full"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/timeline'}
            variant="outline"
            className="w-full"
          >
            Go to Timeline
          </Button>
        </div>
      </div>
    </div>
  );
}
