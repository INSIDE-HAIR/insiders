/**
 * Authentication Middleware for Video Conferencing
 */
import { NextRequest } from "next/server";
// Note: In a real implementation, you would import from the actual auth config
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/src/lib/auth";

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

/**
 * Get current user from request
 */
export async function getCurrentUser(
  request: NextRequest
): Promise<User | null> {
  try {
    // For now, return the seeded user
    // In production, this would get the session from NextAuth and fetch the user from DB
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const user = await prisma.user.findFirst({
      where: { email: "admin@example.com" },
    });

    await prisma.$disconnect();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRole: string): boolean {
  if (!user) return false;

  const roleHierarchy = {
    USER: 1,
    TRAINER: 2,
    ADMIN: 3,
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user can access video conferencing features
 */
export function canAccessVideoConferencing(user: User | null): boolean {
  return hasRole(user, "TRAINER");
}

/**
 * Check if user can manage video spaces
 */
export function canManageVideoSpaces(user: User | null): boolean {
  return hasRole(user, "ADMIN");
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

/**
 * Middleware to require specific role
 */
export async function requireRole(
  request: NextRequest,
  role: string
): Promise<User> {
  const user = await requireAuth(request);

  if (!hasRole(user, role)) {
    throw new Error(`Role ${role} required`);
  }

  return user;
}

/**
 * Middleware to require admin access
 */
export async function requireAdmin(request: NextRequest): Promise<User> {
  return requireRole(request, "ADMIN");
}
