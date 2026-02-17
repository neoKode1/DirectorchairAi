import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DirectorChair AI - AI Video Studio",
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
          "antialiased"
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="mobile-header border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 sm:h-16 lg:h-[60px] max-w-screen-2xl mx-auto items-center px-4 sm:px-6 lg:px-8">
                {/* Left: Brand */}
                <Link
                  href="/"
                  className="flex items-center hover:opacity-80 transition-opacity shrink-0"
                >
                  <span className="text-sm sm:text-base lg:text-lg font-extralight tracking-[0.25em] text-foreground uppercase">
                    DIRECTORCHAIR AI
                  </span>
                </Link>

                {/* Center: Nav Links */}
                <nav className="flex-1 flex items-center justify-center gap-6 sm:gap-8 lg:gap-12 text-[11px] sm:text-xs lg:text-sm font-light tracking-[0.15em] uppercase">
                  <Link
                    href="/timeline"
                    className="transition-colors hover:text-foreground text-foreground/50 whitespace-nowrap"
                  >
                    Studio
                  </Link>
                  <Link
                    href="/expo"
                    className="transition-colors hover:text-foreground text-foreground/50 whitespace-nowrap"
                  >
                    Expo
                  </Link>
                  <Link
                    href="/script-maker"
                    className="transition-colors hover:text-foreground text-foreground/50 whitespace-nowrap"
                  >
                    Script Maker
                  </Link>
                  <Link
                    href="/personas"
                    className="transition-colors hover:text-foreground text-foreground/50 whitespace-nowrap"
                  >
                    Personas
                  </Link>
                  <ThemeToggle />
                </nav>

                {/* Right: DeepTech */}
                <span className="text-[10px] lg:text-xs font-light tracking-[0.15em] text-foreground/40 uppercase shrink-0">
                  DEEPTECH
                </span>
              </div>
            </header>
            <main className="flex-1 mobile-main">{children}</main>
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
