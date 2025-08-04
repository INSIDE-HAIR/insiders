import { validateAdminAccess } from '@/src/lib/server-access-control';
import { UsersPageClient } from './client-page';

/**
 * Server component wrapper for Users page
 * Implements database-powered access validation for admin user management
 */
export default async function UsersPage() {
  // Validate admin access with database checks
  const user = await validateAdminAccess('/[lang]/admin/users');

  console.log(`✅ Admin access validated for ${user.email} to user management`);

  // Pass validated user to client component
  return <UsersPageClient user={user} />;
}