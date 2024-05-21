import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

export type SettingsUser = {
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  image: string | null;
  password: string | null;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

export type UpdateUser = {
  id?: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  newPassword?: string | null;
  contactNumber?: string | null;
  terms?: boolean | null;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  holdedId?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  isOAuth: boolean;
  lastLogin?: Date | null;
};
