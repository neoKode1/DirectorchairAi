import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DirectorchairAI - AI Video Studio",
  description: "Create stunning videos with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "antialiased",
          "dark:bg-background"
        )}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <header className="mobile-header border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mobile-container flex h-14 max-w-screen-2xl items-center">
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <Link
                    href="/"
                    className="mr-4 sm:mr-6 flex items-center space-x-2 hover:opacity-80 mobile-touch-target"
                  >
                    <h1 className="mobile-text-sm sm:text-base font-bold">DirectorchairAI</h1>
                  </Link>
                  <nav className="flex items-center gap-4 sm:gap-6 mobile-text-xs sm:text-sm">
                    <Link
                      href="https://deeptech.ai"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-foreground/80 text-foreground/60 mobile-touch-target"
                    >
                      Deeptech AI
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1 mobile-main">{children}</main>
          </div>
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
