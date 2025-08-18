export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import VideoIntegrationsClient from "./client-page";

export default async function VideoIntegrationsPage() {
  await validateAdminAccess("/admin/video-conferencing/integrations");
  return <VideoIntegrationsClient />;
}
