import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// In development mode, skip middleware entirely
export default function middleware(req: any) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }
  
  return withAuth(req, {
    callbacks: {
      authorized({ req, token }) {
        return !!token;
      },
    },
  });
}

export const config = {
  // Protect all routes under /api/auth
  matcher: [
    "/api/auth/:path*",
    // Add other protected routes here
  ],
};
