import { emailConfig, emailDefaults } from "../email-config";

interface ErrorReportAssignData {
  reportId: string;
  fileName: string;
  fileId?: string;
  message: string;
  reporterName: string;
  reporterEmail: string;
  assigneeName: string;
  decodedFileName?: string;
  category?: string;
  status: string;
}

export const sendErrorReportAssignEmail = async (
  recipient: string,
  reportData: ErrorReportAssignData
) => {
  try {
    // Traducir el estado a español
    const statusText =
      {
        pending: "Pendiente",
        "in-progress": "En progreso",
        resolved: "Resuelto",
      }[reportData.status] || reportData.status;

    await emailConfig.emails.send({
      from: emailDefaults.from,
      to: recipient,
      subject: `Te han asignado un reporte de error: ${reportData.fileName}`,
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
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Has sido asignado a un reporte de error</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; line-height: 1.6;">
                  Hola ${reportData.assigneeName},
                </p>
                
                <p style="color: #333; line-height: 1.6;">
                  Has sido asignado para revisar un reporte de error. Por favor, revisa los detalles a continuación:
                </p>
                
                <h2 style="margin-top: 20px; color: #333;">Detalles del Reporte</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666; width: 30%;"><strong>Archivo:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${
                      reportData.fileName
                    }</td>
                  </tr>
                  ${
                    reportData.decodedFileName
                      ? `<tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Nombre decodificado:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${reportData.decodedFileName}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    reportData.category
                      ? `<tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Categoría:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${reportData.category}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Estado:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${statusText}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Reportado por:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${
                      reportData.reporterName
                    } (${reportData.reporterEmail})</td>
                  </tr>
                </table>
                
                <h3 style="color: #333; margin-bottom: 10px;">Mensaje del reporte:</h3>
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
                
                <p style="color: #666; line-height: 1.6; margin-top: 30px;">
                  Por favor, revisa este reporte a la brevedad posible. Si tienes alguna pregunta, contacta al administrador del sistema.
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
      `Email de asignación de reporte enviado con éxito a ${recipient}`
    );

    return true;
  } catch (error) {
    console.error("Error al enviar el email de asignación de reporte:", error);
    throw error;
  }
};
