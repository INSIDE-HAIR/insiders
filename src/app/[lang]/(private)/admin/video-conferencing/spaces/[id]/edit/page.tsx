export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import EditVideoSpaceClient from "./client-page";

interface EditVideoSpacePageProps {
  params: {
    id: string;
    lang: string;
  };
}

export default async function EditVideoSpacePage({
  params,
}: EditVideoSpacePageProps) {
  await validateAdminAccess(
    `/admin/video-conferencing/spaces/${params.id}/edit`
  );
  return <EditVideoSpaceClient spaceId={params.id} />;
}
