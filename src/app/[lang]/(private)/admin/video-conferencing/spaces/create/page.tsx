export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import CreateVideoSpaceClient from "./client-page";

export default async function CreateVideoSpacePage() {
  await validateAdminAccess("/admin/video-conferencing/spaces/create");
  return <CreateVideoSpaceClient />;
}
