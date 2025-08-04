import { validateAdminAccess } from '@/src/lib/server-access-control';
import { DriveExplorerClient } from './client-page';

/**
 * Server component wrapper for Drive page
 * Implements database-powered access validation for admin drive features
 */
export default async function DrivePage() {
  // Validate admin access with database checks
  const user = await validateAdminAccess('/[lang]/admin/drive');

  console.log(`✅ Admin access validated for ${user.email} to drive management`);

  // Pass validated user to client component
  return <DriveExplorerClient user={user} />;
}