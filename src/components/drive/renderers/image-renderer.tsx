import { GenericRenderer } from "./generic-renderer";
import type { HierarchyItem } from "@/src/features/drive/types/index";

interface ImageRendererProps {
  item: HierarchyItem;
}

export function ImageRenderer({ item }: ImageRendererProps) {
  return <GenericRenderer item={item} contentType='Imagen' />;
}
