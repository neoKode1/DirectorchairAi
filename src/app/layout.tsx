import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

import { cn } from "@/lib/utils";
import { WarpCanvas } from "@/components/warp-canvas";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-display" });

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
          playfair.variable,
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
            {/* Global interactive warp grid background */}
            <WarpCanvas className="fixed z-0" />
            {/* Film grain overlay */}
            <div className="fixed inset-0 grain pointer-events-none z-[60]" />

            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5 lg:px-12 border-b border-border/50 bg-background/80 backdrop-blur-md">
              <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
                {/* Left: Brand */}
                <Link
                  href="/"
                  className="text-sm font-medium tracking-tighter text-foreground hover:text-muted-foreground transition-colors shrink-0"
                >
                  DIRECTORCHAIR AI
                </Link>

                {/* Center: Nav Links */}
                <nav className="hidden md:flex items-center gap-8">
                  <Link
                    href="/timeline"
                    className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Studio
                  </Link>
                  <span
                    className="text-xs font-light text-muted-foreground/50 cursor-not-allowed select-none"
                    title="Coming soon"
                  >
                    Expo
                  </span>
                  <Link
                    href="/script-maker"
                    className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Script Maker
                  </Link>
                  <Link
                    href="/personas"
                    className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                  >
                    Personas
                    <span className="text-[9px] font-medium tracking-wider uppercase px-1 py-0.5 border border-border text-muted-foreground">Preview</span>
                  </Link>
                  <ThemeToggle />
                </nav>

                {/* Right: DeepTech */}
                <span className="text-xs font-light tracking-wider text-muted-foreground uppercase shrink-0">
                  DEEPTECH
                </span>
              </div>
            </header>
            <main className="flex-1 pt-[72px] overflow-x-hidden">{children}</main>
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
