import { ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { ContentItem } from "@/src/features/drive/types/content-types";

interface ButtonRendererProps {
  item: ContentItem;
}

export function ButtonRenderer({ item }: ButtonRendererProps) {
  return (
    <Button
      className='bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-none mx-auto'
      size='sm'
      asChild
    >
      <a
        href={item.transformedUrl?.preview}
        target='_blank'
        rel='noopener noreferrer'
      >
        <ExternalLink className='h-4 w-4' />
        <span>{item.displayName}</span>
      </a>
    </Button>
  );
}
