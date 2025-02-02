import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nano - AI Video Studio",
  description: "AI-powered video creation studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark:bg-background`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <Link
                    href="/"
                    className="mr-6 flex items-center space-x-2 hover:opacity-80"
                  >
                    <h1 className="font-bold sm:inline-block">Nano</h1>
                  </Link>
                  <nav className="flex items-center gap-6 text-sm">
                    <Link
                      href="https://deeptech.ai"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Deeptech AI
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
