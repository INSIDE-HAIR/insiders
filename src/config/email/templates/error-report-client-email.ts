import { emailConfig, emailDefaults } from "../email-config";

interface ErrorReportData {
  fileName: string;
  fileId?: string;
  message: string;
  fullName: string;
  email: string;
}

export const sendErrorReportClientEmail = async (
  reportData: ErrorReportData
) => {
  try {
    await emailConfig.emails.send({
      from: emailDefaults.from,
      to: [reportData.email],
      subject: `Confirmación: Reporte de error en ${reportData.fileName}`,
      html: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif;">
          <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <tr>
              <td style="padding: 40px 30px; text-align: center; background-color: #1976d2;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Hemos recibido tu reporte</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <h2 style="margin-top: 0; color: #333;">Gracias por informarnos</h2>
                
                <p style="color: #666; line-height: 1.6;">Hola ${
                  reportData.fullName
                },</p>
                
                <p style="color: #666; line-height: 1.6;">
                  Gracias por informarnos sobre el problema con el archivo <strong>${
                    reportData.fileName
                  }</strong>.
                  Nuestro equipo lo revisará lo antes posible y tomaremos las medidas necesarias.
                </p>
                
                <p style="color: #666; line-height: 1.6;">Este es un resumen de tu reporte:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${reportData.message.replace(
                    /\n/g,
                    "<br>"
                  )}</p>
                </div>
                
                <p style="color: #666; line-height: 1.6;">
                  Si tienes alguna pregunta o información adicional, no dudes en responder a este correo.
                </p>
                
                <p style="color: #666; line-height: 1.6;">
                  Atentamente,<br/>
                  El equipo de ${emailDefaults.brand.name}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 30px; background-color: #f5f5f5; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  © ${new Date().getFullYear()} ${
        emailDefaults.brand.name
      }. Todos los derechos reservados.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>`,
    });

    console.info(
      "Email de confirmación de reporte enviado con éxito a:",
      reportData.email
    );

    return true;
  } catch (error) {
    console.error(
      "Error al enviar el email de confirmación al cliente:",
      error
    );
    throw error;
  }
};
