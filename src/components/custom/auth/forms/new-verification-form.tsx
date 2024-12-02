import CardWrapper from "../card/auth-card-wrapper";
import FormSuccess from "../../../share/MessageSuccessBox";
import FormError from "../../../share/MessageErrorBox";

type Props = {
  message: string;
  success: boolean;
};

const NewVerificationForm = ({ message, success }: Props) => {
  return (
    <CardWrapper
      headerLabel="Confirmando tu verificación de email."
      backButtonLabel="Regresar a página de iniciar sesión"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center justify-center w-full">
        {success ? (
          <FormSuccess message={message} />
        ) : (
          <FormError message={message} />
        )}
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;
