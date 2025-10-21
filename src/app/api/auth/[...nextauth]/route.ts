import NextAuth from "next-auth";
import { authOptions } from "../auth.config";

// Specify Node.js runtime
export const runtime = "nodejs";

// Create and export the auth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
