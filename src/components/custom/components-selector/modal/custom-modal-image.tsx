import { useState } from "react";
import Image from "next/image";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import { ComponentsProps } from "@/src/types/components-schemas";
import { EyeIcon } from "lucide-react";

export default function CustomImageModal({ item }: ComponentsProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        variant="solid"
        className="hover:opacity-100 rounded-none mb-3 bg-zinc-900 text-zinc-50"
        onPress={onOpen}
      >
        <EyeIcon className="w-3"></EyeIcon>
        Donde ponerlo
      </Button>
      <Modal
        backdrop={"blur"}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="max-h-screen bg-gray-100/60 flex mb-40 justify-center align-middle"
      >
        <ModalContent className="items-center">
          <ModalHeader className="flex flex-col gap-1">
            {item.title || "Imagen"}
          </ModalHeader>
          <ModalBody className="relative w-full max-w-(--breakpoint-md)">
            {item.url && item.darkModeUrl ? (
              <>
                <div className="relative w-full h-64 dark:hidden">
                  <Image
                    alt={item.title || "Custom Image"}
                    className="object-cover border-gray-700/20 border shadow-sm w-full"
                    height={1080}
                    src={item.url}
                    width={1080}
                  />
                </div>
                <div className="relative w-full h-64 hidden dark:block">
                  <Image
                    alt={item.title || "Custom Image"}
                    className="object-cover border-gray-700/20 border shadow-sm w-full"
                    height={1080}
                    src={item.url}
                    width={1080}
                  />
                </div>
              </>
            ) : (
              item.url && (
                <div className="relative w-full h-64">
                  <Image
                    alt={item.title || "Custom Image"}
                    className="object-cover border-gray-700/20 border shadow-sm w-full"
                    height={1080}
                    src={item.url}
                    width={1080}
                  />
                </div>
              )
            )}
          </ModalBody>
          <ModalFooter className="justify-center align-middle items-center text-tiny">
            <Button variant="ghost" onPress={onOpenChange}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
