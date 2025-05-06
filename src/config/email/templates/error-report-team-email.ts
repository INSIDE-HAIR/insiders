import { emailConfig, emailDefaults } from "../email-config";

interface ErrorReportData {
  fileName: string;
  fileId?: string;
  message: string;
  fullName: string;
  email: string;
}

export const sendErrorReportTeamEmail = async (
  recipients: string[],
  ccRecipients: string[],
  bccRecipients: string[],
  reportData: ErrorReportData
) => {
  try {
    await emailConfig.emails.send({
      from: emailDefaults.from,
      to: recipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      subject: `Error en ${reportData.fileName}`,
      html: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif;">
          <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <tr>
              <td style="padding: 40px 30px; text-align: center; background-color: #d32f2f;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Reporte de Error en Archivo</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <h2 style="margin-top: 0; color: #333;">Detalles del Reporte</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666; width: 30%;"><strong>Archivo:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${
                      reportData.fileName
                    }</td>
                  </tr>
                  ${
                    reportData.fileId
                      ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>ID de Archivo:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333; word-break: break-all;">${reportData.fileId}</td>
                  </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Reportado por:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${
                      reportData.fullName
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${
                      reportData.email
                    }</td>
                  </tr>
                </table>
                
                <h3 style="color: #333; margin-bottom: 10px;">Mensaje:</h3>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
                  <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${reportData.message.replace(
                    /\n/g,
                    "<br>"
                  )}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${emailDefaults.baseUrl}/admin/drive/errors" 
                     style="background-color: #1976d2; 
                            color: #ffffff; 
                            padding: 12px 30px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block;">
                    Ver Todos los Reportes
                  </a>
                </div>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 0; text-align: center; font-size: 14px;">
                  Este mensaje ha sido generado automáticamente.
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

    console.info("Email de reporte de error enviado con éxito al equipo");

    return true;
  } catch (error) {
    console.error(
      "Error al enviar el email de reporte de error al equipo:",
      error
    );
    throw error;
  }
};
