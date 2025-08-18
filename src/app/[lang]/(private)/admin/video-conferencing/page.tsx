export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import VideoConferencingClient from "./client-page";

export default async function VideoConferencingPage() {
  await validateAdminAccess("/admin/video-conferencing");
  return <VideoConferencingClient />;
}
