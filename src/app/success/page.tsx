import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Thank you for your subscription. Your account has been upgraded and your credits have been added.
        </p>

        <div className="space-y-4">
          <Link href="/app">
            <Button size="lg" className="mr-4">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/support">
            <Button variant="outline" size="lg">
              Need Help?
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 