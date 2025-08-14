export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import AccessControlDocsClient from "./client-page";

export default async function AccessControlDocsPage() {
  await validateAdminAccess("/admin/access-control/docs");

  return <AccessControlDocsClient />;
}