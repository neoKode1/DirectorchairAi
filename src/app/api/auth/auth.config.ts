import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createUserProfile, getUserProfile } from "@/lib/supabase";
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
      // If the url is /timeline, allow it
      if (url.startsWith(`${baseUrl}/timeline`)) {
        return url;
      }
      // Default to /timeline for any other URLs
      return `${baseUrl}/timeline`;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists in Supabase
          const { data: existingUser } = await getUserProfile(user.id);

          if (!existingUser) {
            // Create new user profile in Supabase
            await createUserProfile({
              id: user.id,
              email: user.email,
              name: user.name || undefined,
              avatar_url: user.image || undefined,
            });
          }
          return true;
        } catch (error) {
          console.error("Error creating user profile:", error);
          return false;
        }
      }
      return true;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!;

        // Get user data from Supabase
        try {
          const { data: userProfile } = await getUserProfile(token.sub!);
          if (userProfile) {
            session.user.credits = userProfile.credits;
            session.user.subscriptionTier = userProfile.subscription_tier as SubscriptionTier;
          } else {
            session.user.credits = 0;
            session.user.subscriptionTier = "free";
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          session.user.credits = 0;
          session.user.subscriptionTier = "free";
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in - data will be fetched in session callback
        token.sub = user.id;
      }

      if (trigger === "update" && session) {
        // Update token when session is updated
        token.credits = session.user.credits;
        token.subscriptionTier = session.user.subscriptionTier;
      }

      return token;
    },
  },
}; 