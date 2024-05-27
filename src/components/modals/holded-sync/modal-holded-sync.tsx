import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import HoldedSyncForm from "./_components/HoldedSyncForm";

export default function ModalHoldedSync({
  holdedId,
  insidersId,
}: {
  holdedId: string | null | undefined;
  insidersId: string | null | undefined;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        variant="ghost"
        className=" hover:opacity-100 rounded-full"
        onPress={onOpen}
      >
        Sincronizar con Holded
      </Button>
      <Modal
        backdrop={"blur"}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="max-h-screen bg-gray-100/60 [&>button]:text-danger [&>button]:border-danger hover:[&>button]:bg-danger hover:[&>button]:text-white [&>button]:border-1 flex mb-40 justify-center align-middle "
      >
        <ModalContent className="items-center">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Sincronziar con Holded
              </ModalHeader>
              <ModalBody className="relative w-full">
                <HoldedSyncForm
                  holdedId={holdedId && holdedId}
                  insidersId={insidersId && insidersId}
                />
              </ModalBody>
              <ModalFooter className="justify-center align-middle items-center">
                <Button color="danger" variant="solid" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
