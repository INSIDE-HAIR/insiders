import { EyeFilledIcon } from "@/src/icons/eyes-icon/EyeFilledIcon";
import {
  Button,
  Card,
  CardFooter,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../ui/carousel";

export default function CustomCards({
  item,
  renderButtons,
}: {
  item: any;
  renderButtons: any;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const ImageModal = ({
    alt,
    src,
    previews, // Añade previews como prop
  }: {
    alt: string;
    src: string;
    previews: Array<{ transformedUrl: { imgEmbed: string } }>; // Asegúrate de que este tipo coincida con la estructura de tus datos
  }) => {
    return (
      <Modal
        backdrop={"blur"}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="max-h-screen bg-zinc-900 text-zinc-50 [&>button]:text-zinc-50 [&>button]:border-red-900 hover:[&>button]:border-red-950 hover:[&>button]:transition-colors-opacity  hover:[&>button]:bg-red-950  hover:[&>button]:transition [&>button]:bg-red-900   [&>button]:mt-2 [&>button]:mr-4  hover:[&>button]:text-zinc-50 [&>button]:border flex mb-40 justify-center align-middle "
      >
        <ModalContent className="items-center">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 ">{alt}</ModalHeader>
              <ModalBody className="relative w-full">
                <Carousel>
                  <CarouselContent
                    className={`${previews && previews.length > 1 && "pb-10"}`}
                  >
                    {previews && previews.length > 1 ? (
                      previews.map((preview, index) => (
                        <CarouselItem key={index}>
                          <Image
                            alt={`${alt} ${index + 1}`}
                            className="object-cover border-gray-700/20 border shadow-sm w-full"
                            height={1080}
                            src={preview.transformedUrl.imgEmbed}
                            width={1080}
                          />
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <Image
                          alt={alt}
                          className="object-cover border-gray-700/20 border shadow-sm w-full"
                          height={1080}
                          src={src}
                          width={1080}
                        />
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  {previews && previews.length > 1 && (
                    <div className="absolute bottom-0 left-0 flex w-full bg-red-500">
                      <CarouselPrevious className="ml-20 text-zinc-50 bg-gray-500 hover:bg-gray-700" />
                      <CarouselNext className="mr-20 text-zinc-50 bg-gray-500 hover:bg-gray-700" />
                    </div>
                  )}
                </Carousel>
              </ModalBody>
              <ModalFooter className="justify-center align-middle items-center">
                <Button
                  color="danger"
                  variant="solid"
                  className="bg-red-900 rounded-none"
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Card
      isFooterBlurred
      radius="none"
      className="border-none gap-2 px-2 py-3 flex items-center justify-center col-span-1 bg-zinc-900 text-zinc-50"
      key={item.title}
      style={{ order: item.order }}
    >
      <div className="flex flex-col items-center  ">
        <span className="text-xs ">{item.title.split(":")[1].trim()}</span>
        <span className="w-52 px-8">{item.title.replace(/:.*/, "")}</span>
      </div>
      {item.transformedUrl.imgEmbed && (
        <div className="relative">
          <div className="  absolute right-1 top-1">
            <Button
              onPress={onOpen}
              isIconOnly
              variant="faded"
              className=" hover:opacity-100 rounded-full"
            >
              <EyeFilledIcon />
            </Button>
            <ImageModal
              alt={item.title}
              src={
                item.preview[0]?.transformedUrl.imgEmbed ||
                item.transformedUrl.imgEmbed
              }
              previews={item.preview || []} // Pasa item.preview como prop
            />
          </div>

          <Image
            alt={item.title}
            className="object-cover border-gray-700/20 border shadow-sm w-52"
            height={200}
            src={
              item.preview[0]?.transformedUrl.imgEmbed ||
              item.transformedUrl.imgEmbed
            }
            width={200}
          />
        </div>
      )}

      <CardFooter className="flex mx-auto flex-row flex-wrap self-start justify-center before:bg-zinc-50/10 border-zinc-50/20 border overflow-hidden py-1  bottom-1 w-52 shadow-small z-10">
        {renderButtons(item)}
      </CardFooter>
    </Card>
  );
}

