import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "VENDOR" | "ADMIN";
      isVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "VENDOR" | "ADMIN";
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "VENDOR" | "ADMIN";
    isVerified: boolean;
  }
}
