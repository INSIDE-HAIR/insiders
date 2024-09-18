import {
  ClientField,
  ConsultingAndMentoringField,
  CustomField,
  MarketingField,
  SalesField,
  TrainingField,
  UserRole,
} from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
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
  holdedId: string | null;
  createdHoldedSyncAt: Date | null;
  lastHoldedSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  isOAuth: boolean;
  groups: string[];
  tags: string[];
  resources: string[];
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    emailVerified: Date | null;
  }
}
