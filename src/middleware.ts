import { NextResponse } from "next/server";

// Authentication disabled for development
// All routes are accessible without authentication
export default function middleware(req: any) {
  return NextResponse.next();
}

export const config = {
  // Middleware applies to all routes but does not enforce authentication
  matcher: [
    "/timeline/:path*",
    "/api/auth/:path*",
    "/api/generate/:path*",
  ],
};
