import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      lastName: string | null;
      email: string;
      emailVerified: Date | null;
      image: string | null;
      contactNumber: string | null;
      terms: boolean;
      role: UserRole;
      isTwoFactorEnabled: boolean;
      isOAuth: boolean;
      groups: string[];
      tags: string[];
      resources: string[];
      accessToken?: string;
    };
  }

  interface User {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    contactNumber: string | null;
    terms: boolean;
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
    groups: string[];
    tags: string[];
    resources: string[];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
    groups: string[];
    tags: string[];
    resources: string[];
    accessToken?: string;
  }
}
