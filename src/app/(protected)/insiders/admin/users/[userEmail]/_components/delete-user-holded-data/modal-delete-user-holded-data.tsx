import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import DeleteHoldedDataUserForm from "./_components/DeleteHoldedDataUserForm";

export default function ModalDeleteUser({
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
        Borrar Datos Importados de Holded
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
                Borrar Datos Importados de Holded
              </ModalHeader>
              <ModalBody className="relative w-full">
                <DeleteHoldedDataUserForm userId={insidersId} />
              </ModalBody>
              <ModalFooter className="justify-center align-middle items-center" />
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
