import { Button } from "@nextui-org/react";
import { ComponentsProps } from "@/src/lib/types/components-schemas";

function button({ index, item }: ComponentsProps) {
  return (
    <Button
      variant="faded"
      className="flex bg-gray-700 text-white py-2 px-4 rounded-full mx-auto mb-4"
      style={{ order: item.order || index }}
      onClick={() => {
        window.open(item && item.url, "_blank");
      }}
    >
      {item && item.title}
    </Button>
  );
}

export default button;
