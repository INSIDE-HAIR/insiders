import { ContentProvider } from "@/src/context/marketing-salon/content-context";
import ContentLayout from "@/src/components/marketing-salon/layout/content-layout";
import contentDataRaw from "@/db/marketing-salon/content-data.json";
import { DriveType, type HierarchyItem } from "@/src/features/drive/types";

interface MarketingPageProps {
  params: {
    id: string;
  };
}

// Adapter function to convert JSON data to proper HierarchyItem type
function adaptContentData(data: any[]): HierarchyItem[] {
  return data.map((item) => ({
    ...item,
    driveType: item.driveType === "folder" ? DriveType.FOLDER : DriveType.FILE,
    children: item.children ? adaptContentData(item.children) : [],
  }));
}

// Convert the raw JSON data to proper HierarchyItem type
const contentData = adaptContentData(contentDataRaw);

export default function MarketingPage({ params }: MarketingPageProps) {
  return (
    <ContentProvider initialData={contentData} routeParams={{ id: params.id }}>
      <ContentLayout />
    </ContentProvider>
  );
}
