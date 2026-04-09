import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware — currently pass-through.
 * Rate limiting is handled inside each API route via applyRateLimit().
 */
export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
};
