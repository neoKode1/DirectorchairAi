import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware for all API routes.
 * - Development: skip auth entirely for local iteration speed
 * - Production: require a valid NextAuth session token
 *
 * The fal/proxy route is excluded because it's called by the @fal-ai/client
 * SDK which handles its own auth via FAL_KEY on the server side.
 */
export default function middleware(req: NextRequest) {
  // Dev mode: pass through
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // fal/proxy has its own server-side auth via FAL_KEY — don't require user session
  if (req.nextUrl.pathname.startsWith("/api/fal/proxy")) {
    return NextResponse.next();
  }

  // All other API routes: require valid session
  return (withAuth as any)(req, {
    callbacks: {
      authorized({ token }: { token: any }) {
        return !!token;
      },
    },
  });
}

export const config = {
  matcher: [
    // ── Protect ALL API routes except auth callbacks ──
    "/api/generate/:path*",
    "/api/chat/:path*",
    "/api/fal/:path*",
    "/api/personas/:path*",
    "/api/script-maker/:path*",
    "/api/extract-prompt/:path*",
    "/api/generate-video/:path*",
    "/api/poll-task/:path*",
    "/api/upload-image/:path*",
  ],
};
