export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import GroupsClient from "./client-page";

export default async function GroupsPage() {
  await validateAdminAccess("/admin/groups");

  return <GroupsClient />;
}