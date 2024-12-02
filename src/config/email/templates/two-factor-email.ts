import { emailConfig, emailDefaults } from "../email-config";

export const sendTwoFactorEmail = async (email: string, token: string) => {
  const confirmLink = `${emailDefaults.baseUrl}/auth/two-factor?token=${token}&email=${email}`;
  
  try {
    await emailConfig.emails.send({
      from: emailDefaults.from,
      to: email,
      subject: "Código de verificación de dos factores",
      html: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif;">
          <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <tr>
              <td style="padding: 40px 30px; text-align: center; background-color: ${emailDefaults.brand.color};">
                <h1 style="color: ${emailDefaults.brand.textColor}; margin: 0; font-size: 24px;">${emailDefaults.brand.name}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <h2 style="margin-top: 0; color: #333;">Código de verificación de dos factores</h2>
                <p style="color: #666; line-height: 1.6;">
                  Has solicitado iniciar sesión en tu cuenta. Utiliza el siguiente código para completar la verificación de dos factores:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
                    ${token}
                  </div>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmLink}" 
                     style="background-color: ${emailDefaults.brand.color}; 
                            color: ${emailDefaults.brand.textColor}; 
                            padding: 12px 30px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block;">
                    Verificar Código
                  </a>
                </div>
                <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
                  Si no intentaste iniciar sesión, por favor ignora este correo o contacta con soporte.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; background-color: #f5f5f5; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  © ${new Date().getFullYear()} ${emailDefaults.brand.name}. Todos los derechos reservados.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>`,
    });
    
    console.info("Email de dos factores enviado con éxito a:", email);
  } catch (error) {
    console.error("Error al enviar el email de dos factores:", error);
    throw error;
  }
}; 