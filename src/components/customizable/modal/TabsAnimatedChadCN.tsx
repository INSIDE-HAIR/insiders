import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import { ComponentsProps } from "@/src/lib/types/components-schemas";
import ComponentsSelector from "../../components-selector/components-selector";

export default function TabsAnimatedChadCN({
  index,
  item,
  dataMarketingCards,
}: ComponentsProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        variant="ghost"
        className="hover:opacity-100 rounded-full"
        onPress={onOpen}
      >
        {item && item.buttonText ? item.buttonText : "Abrir Modal"}
      </Button>
      <Modal
        backdrop={"blur"}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="max-h-screen bg-gray-100/60 flex mb-40 justify-center align-middle"
      >
        <ModalContent className="items-center">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {item && item.title}
              </ModalHeader>
              <ModalBody className="relative w-full">
                {item.content &&
                  item.content.map(
                    (
                      contentItem: typeof item & { index: number },
                      contentIndex: number
                    ) => (
                      <ComponentsSelector
                        key={contentItem.id}
                        index={contentIndex}
                        item={
                          {
                            ...contentItem,
                            index: contentIndex,
                          } as typeof item & { index: number }
                        } // Add 'index' property to the item object
                        dataMarketingCards={dataMarketingCards}
                      />
                    )
                  )}
              </ModalBody>
              <ModalFooter className="justify-center align-middle items-center text-tiny">
                {item.footer &&
                  item.footer.map(
                    (
                      footerItem: typeof item & { index: number },
                      footerIndex: number
                    ) => (
                      <ComponentsSelector
                        key={footerItem.id}
                        index={footerIndex}
                        item={
                          {
                            ...footerItem,
                            index: footerIndex,
                          } as typeof item & { index: number }
                        } // Add 'index' property to the item object
                        dataMarketingCards={dataMarketingCards}
                      />
                    )
                  )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
