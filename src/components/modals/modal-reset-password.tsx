import ResetPasswordForm from "@/src/components/auth/ResetPasswordForm";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Button,
} from "@nextui-org/react";

function ModalResetPassword({ email }: { email: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        variant="ghost"
        className=" hover:opacity-100 rounded-full"
        onPress={onOpen}
      >
        Resetear Contraseña
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
                {" "}
                Resetear Contraseña
              </ModalHeader>
              <ModalBody className="relative w-full">
                <ResetPasswordForm email={email && email} />
              </ModalBody>
              <ModalFooter className="justify-center align-middle items-center text-tiny">
                Al hacer clic en &quot;Enviar email de recuperación&quot; se
                enviará un correo al usuario para que pueda restablecer su
                contraseña.
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ModalResetPassword;
