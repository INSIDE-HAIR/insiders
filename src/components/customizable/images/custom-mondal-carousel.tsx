import { ComponentsProps } from "@/src/types/components-schemas";
import { Carousel, CarouselItem } from "@/src/components/ui/carousel";
import CustomImageModal from "@/src/components/customizable/images/custom-modal-image";

export default function CustomCarouselModal({ item }: ComponentsProps) {
  return (
    <div className="flex flex-col items-center my-4">
      <Carousel className="w-full max-w-screen-lg">
        {item.content && item.content.length > 0 ? (
          item.content.map((contentItem, contentIndex) => (
            <CarouselItem key={contentItem.id}>
              <CustomImageModal
                item={contentItem}
                index={contentIndex}
                dataMarketingCards={undefined}
              />
            </CarouselItem>
          ))
        ) : (
          <div className="text-center">No hay contenido disponible</div>
        )}
      </Carousel>
    </div>
  );
}
