import React from "react";
// Definir la ruta completa usando la variable de entorno
const resetPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`;

function ForgotPasswordButton() {
  return (
    <a
      href={resetPasswordUrl}
      className="text-tiny hover:text-zinc-900/80 underline text-zinc-900 font-bold hover:underline"
    >
      ¿Olvidaste tu contraseña?
    </a>
  );
}

export default ForgotPasswordButton;
