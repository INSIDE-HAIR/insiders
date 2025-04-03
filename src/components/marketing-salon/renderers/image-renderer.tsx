import { GenericRenderer } from "./generic-renderer";
import type { ContentItem } from "@/src/features/drive/types/content-types";

interface ImageRendererProps {
  item: ContentItem;
}

export function ImageRenderer({ item }: ImageRendererProps) {
  return <GenericRenderer item={item} contentType='Imagen' />;
}
