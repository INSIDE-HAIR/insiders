export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import VideoSpacesClient from "./client-page";

export default async function VideoSpacesPage() {
  await validateAdminAccess("/admin/video-conferencing/spaces");
  return <VideoSpacesClient />;
}
