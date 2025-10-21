import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// Placeholder type for subscription tiers
type SubscriptionTier = "free" | "pro" | "enterprise";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      credits: number;
      subscriptionTier: SubscriptionTier;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

// Stripe integration removed for minimal deployment

export const authOptions: NextAuthOptions = {
  providers: [
    // Add development credentials provider
    ...(process.env.NODE_ENV === "development" ? [
      CredentialsProvider({
        id: "dev",
        name: "Development",
        credentials: {},
        async authorize() {
          // In development, always return a valid user
          return {
            id: "dev-user-1",
            name: "Development User",
            email: "dev@example.com",
            image: null,
          };
        },
      })
    ] : []),
    // Google provider (only if credentials are available)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    ] : []),
  ],
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-only-for-development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true
      }
    }
  },
  // Stripe events removed for minimal deployment
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If the url is /app, allow it
      if (url.startsWith(`${baseUrl}/app`)) {
        return url;
      }
      // Default to /app for any other URLs
      return `${baseUrl}/app`;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!;
        session.user.credits = token.credits as number || 0;
        session.user.subscriptionTier = token.subscriptionTier as SubscriptionTier || "free";
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.credits = 0;
        token.subscriptionTier = "free";
      }

      if (trigger === "update" && session) {
        token.credits = session.user.credits;
        token.subscriptionTier = session.user.subscriptionTier;
      }

      return token;
    },
  },
}; 