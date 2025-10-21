import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "../globals.css";

export const metadata: Metadata = {
  title: "DirectorchairAI - AI Video Studio",
  description: "Create stunning videos with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased dark">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
