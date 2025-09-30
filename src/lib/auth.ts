/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
              role: true,
              isVerified: true,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            isVerified: user.isVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects after sign in
      if (url.startsWith("/api/auth/signin") || url.startsWith("/signin")) {
        // Let client-side handle the redirect based on role
        return baseUrl;
      }

      // Default redirect behavior
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        token.role = (user as any).role ?? "CUSTOMER";
        token.isVerified = (user as any).isVerified ?? false; // Add type assertion and default
      }

      // Handle Google OAuth
      if (account?.provider === "google" && user) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              role: true,
              isVerified: true, // ADD THIS - fetch isVerified too
            },
          });

          if (!existingUser) {
            const newUser = await db.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                isVerified: true,
                role: "CUSTOMER",
              },
            });
            token.id = newUser.id;
            token.role = newUser.role;
            token.isVerified = newUser.isVerified; // ADD THIS
          } else {
            token.id = existingUser.id;
            token.role = existingUser.role;
            token.isVerified = existingUser.isVerified; // ADD THIS
          }
        } catch (error) {
          console.error("Google auth error:", error);
        }
      }

      // Always fetch fresh data for existing tokens
      if (token.id && !user) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              isVerified: true, // ADD THIS - fetch isVerified on token refresh
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.isVerified = dbUser.isVerified; // ADD THIS
          }
        } catch (error) {
          console.error("Role fetch error:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.isVerified = token.isVerified as boolean; // ADD type assertion

        // Ensure only valid role values are assigned
        const role = token.role;
        if (role === "CUSTOMER" || role === "VENDOR" || role === "ADMIN") {
          session.user.role = role;
        } else {
          session.user.role = "CUSTOMER";
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
