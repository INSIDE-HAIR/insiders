export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import VideoSettingsClient from "./client-page";

export default async function VideoSettingsPage() {
  await validateAdminAccess("/admin/video-conferencing/settings");
  return <VideoSettingsClient />;
}
