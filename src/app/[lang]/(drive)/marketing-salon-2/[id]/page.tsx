import { ContentProvider } from "@/src/context/marketing-salon/content-context";
import ContentLayout from "@/src/components/marketing-salon/layout/content-layout";
import contentData from "@/db/marketing-salon/content-data.json";
import { DriveType } from "@/src/features/drive/types/drive";
import type { HierarchyItem } from "@/src/features/drive/types/hierarchy";

interface MarketingPageProps {
  params: {
    id: string;
  };
}

export default function MarketingPage({ params }: MarketingPageProps) {
  // Convertir contentData a HierarchyItem[] asegurando que driveType sea el enum correcto
  const convertToHierarchyItem = (item: any): HierarchyItem => {
    return {
      ...item,
      driveType: item.driveType === "file" ? DriveType.FILE : DriveType.FOLDER,
      children: Array.isArray(item.children)
        ? item.children.map((child: any) => convertToHierarchyItem(child))
        : [],
    } as HierarchyItem;
  };

  const typedContentData = contentData.map((item: any) =>
    convertToHierarchyItem(item)
  );

  return (
    <ContentProvider
      initialData={typedContentData}
      routeParams={{ id: params.id }}
    >
      <ContentLayout />
    </ContentProvider>
  );
}
