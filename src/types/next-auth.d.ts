import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "VENDOR" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "CUSTOMER" | "VENDOR" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
    role?: "CUSTOMER" | "VENDOR" | "ADMIN";
  }
}
