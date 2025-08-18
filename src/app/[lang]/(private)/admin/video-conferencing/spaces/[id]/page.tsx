export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import VideoSpaceDetailsClient from "./client-page";

interface VideoSpaceDetailsPageProps {
  params: {
    id: string;
    lang: string;
  };
}

export default async function VideoSpaceDetailsPage({
  params,
}: VideoSpaceDetailsPageProps) {
  await validateAdminAccess(`/admin/video-conferencing/spaces/${params.id}`);
  return <VideoSpaceDetailsClient spaceId={params.id} />;
}
