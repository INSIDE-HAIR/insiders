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
  email: string ;
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
  email: string;
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


type Client = {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  contactNumber: string | null;
  terms: boolean;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  holdedId: string | null;
  marketingServices?: any[] | undefined; // Changed to optional
  formationServices?: any[] | undefined; // Changed to optional
  mentoringServices?: any[] | undefined; // Changed to optional
  toolsServices?: any[] | undefined; // Changed to optional
  lastLogin: Date | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date | undefined; // Made optional
  endDate?: Date | undefined; // Made optional
};