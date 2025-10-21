import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-lg border border-border p-6 text-center">
        <div className="text-muted-foreground text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/timeline">
              Go to Timeline
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
