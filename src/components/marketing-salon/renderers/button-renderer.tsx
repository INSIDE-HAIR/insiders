import { ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { getPreviewUrl } from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface ButtonRendererProps {
  item: HierarchyItem;
}

export function ButtonRenderer({ item }: ButtonRendererProps) {
  return (
    <Button
      className='bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-none mx-auto'
      size='sm'
      asChild
    >
      <a href={getPreviewUrl(item)} target='_blank' rel='noopener noreferrer'>
        <ExternalLink className='h-4 w-4' />
        <span>{item.displayName}</span>
      </a>
    </Button>
  );
}
