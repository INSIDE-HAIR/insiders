import { GenericRenderer } from "./generic-renderer";
import type { HierarchyItem } from "@/src/features/drive/types/index";

interface PdfRendererProps {
  item: HierarchyItem;
}

export function PdfRenderer({ item }: PdfRendererProps) {
  return <GenericRenderer item={item} contentType='PDF' />;
}
