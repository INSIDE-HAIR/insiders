import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmailResend = async (email: string, token: string) => {

  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}&email=${email}`;
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: email,
    subject: "Confirma tu email",
    html: `<p>Clic <a href=${confirmLink} target="_blank">en este enlace</a> para confirmar</p>`,
  })
}


export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: email,
    subject: "Confirma tu email",
    html: `<p>Clic <a href=${resetLink} target="_blank">en este enlace</a> para resetear tu contraseña</p>`,
  })

};
