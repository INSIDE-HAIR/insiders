import { ComponentsProps } from "@/src/types/components-schemas";

export default function CustomSlides({ index, item }: ComponentsProps) {
  return (
    item.active && (
      <iframe
        src={item.url}
        className="border-2 border-zinc-200 lg:min-w-[765.789px] w-full overflow-hidden max-w-full bg-zinc-300 mb-4"
        width="750"
        height="460"
        style={{ order: item.order || index }}
        allowFullScreen={true}
      ></iframe>
    )
  );
}
