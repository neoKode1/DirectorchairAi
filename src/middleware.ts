import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow UploadThing API route
  if (request.nextUrl.pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next();
  }

  // Your other middleware logic...
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - uploadthing API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/uploadthing).*)",
  ],
};
