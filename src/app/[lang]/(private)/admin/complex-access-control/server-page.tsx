import { validateAdminAccess } from '@/src/lib/server-access-control';
import { ComplexAccessControlClient } from './client-page';

/**
 * Server component wrapper for Complex Access Control page
 * Implements database-powered access validation
 */
export default async function ComplexAccessControlPage() {
  // Validate admin access with database checks
  const user = await validateAdminAccess('/[lang]/admin/complex-access-control');

  console.log(`✅ Admin access validated for ${user.email} to complex access control`);

  // Pass validated user to client component
  return <ComplexAccessControlClient user={user} />;
}