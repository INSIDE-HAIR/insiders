import { Button } from "@heroui/react";
import { ComponentsProps } from "@/src/types/components-schemas";

export default function CustomButton({ index, item }: ComponentsProps) {
  return (
    <Button
      variant="faded"
      className="flex bg-zinc-900 text-white py-2 px-4 rounded-none border-none mx-auto mb-4"
      style={{ order: item.order || index }}
      onClick={() => {
        window.open(item && item.url, "_blank");
      }}
    >
      {item && item.title}
    </Button>
  );
}
