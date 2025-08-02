import { UserRole } from "@prisma/client";

export interface RouteConfig {
  path: string;
  access: (user: UserSession | null) => boolean;
  redirect?: string;
  roles?: UserRole[];
  permissions?: string[];
  isPublic?: boolean;
  allowedDomains?: string[];
  validate?: (user: UserSession | null, path: string) => boolean;
  category?: string;
  subCategories?: string[];
}

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isAuthenticated: boolean;
  domain?: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  redirect?: string;
  reason?: string;
}
