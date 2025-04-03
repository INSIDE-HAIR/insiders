import { GenericRenderer } from "./generic-renderer";
import type { ContentItem } from "@/src/features/drive/types/content-types";

interface PdfRendererProps {
  item: ContentItem;
}

export function PdfRenderer({ item }: PdfRendererProps) {
  return <GenericRenderer item={item} contentType='PDF' />;
}
