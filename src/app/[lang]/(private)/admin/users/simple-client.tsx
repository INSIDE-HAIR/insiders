"use client";
import { UserSession } from "@/src/types/routes";

interface UsersPageClientProps {
  user: UserSession;
}

export function SimpleUsersClient({ user }: UsersPageClientProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>
      <p>Welcome, {user.email} (Role: {user.role})</p>
      <p>This is a simplified version to test component loading.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>If you see this, the server-side access validation is working!</p>
        <p>The main users component will be restored once we fix the import issues.</p>
      </div>
    </div>
  );
}