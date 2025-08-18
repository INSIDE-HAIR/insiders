export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import VideoAnalyticsClient from "./client-page";

export default async function VideoAnalyticsPage() {
  await validateAdminAccess("/admin/video-conferencing/analytics");
  return <VideoAnalyticsClient />;
}
