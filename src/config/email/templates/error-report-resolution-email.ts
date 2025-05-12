import { emailConfig, emailDefaults } from "../email-config";

interface ErrorResolutionEmailData {
  fileName: string;
  fileId?: string;
  fullName: string;
  email: string;
  reportedAt: string;
  resolvedBy?: string;
  templateType?: "standard" | "detailed" | "formal";
  customSubject?: string;
  customContent?: string;
}

export const templates = {
  standard: {
    id: "standard-resolution",
    name: "Resolución Estándar",
    isDefault: true,
    subject: "Resolución de problema reportado",
    content: `Estimado/a {nombreCliente},

Consideramos que hemos resuelto el problema reportado con el archivo {nombreArchivo}.

Si sigue teniendo problemas, no dude en responder a este correo.

Saludos cordiales,
Equipo de soporte`,
  },
  detailed: {
    id: "detailed-resolution",
    name: "Resolución Detallada",
    isDefault: false,
    subject: "Hemos resuelto su reporte sobre {nombreArchivo}",
    content: `Estimado/a {nombreCliente},

Nos complace informarle que hemos revisado y resuelto el problema que reportó el {fechaReporte} sobre el archivo {nombreArchivo}.

Detalles de la resolución:
- Se verificó el archivo y se aplicaron las correcciones necesarias
- Se realizaron pruebas para confirmar que el problema está solucionado
- El archivo está nuevamente disponible para descarga

Si encuentra algún problema adicional o tiene alguna pregunta, no dude en contactarnos respondiendo a este correo o escribiendo directamente a {correoAsignado}.

Agradecemos su paciencia y colaboración.

Atentamente,
Equipo de soporte técnico`,
  },
  formal: {
    id: "formal-resolution",
    name: "Resolución Formal",
    isDefault: false,
    subject:
      "Notificación oficial: Resolución de incidencia #REF-{nombreArchivo}",
    content: `Estimado/a Sr./Sra. {nombreCliente},

Por medio del presente correo, le informamos que la incidencia reportada el {fechaReporte} relacionada con el archivo "{nombreArchivo}" ha sido formalmente resuelta por nuestro departamento técnico.

Siguiendo nuestros protocolos de calidad, el caso ha sido cerrado después de verificar que el problema reportado ha sido solucionado satisfactoriamente.

Agradecemos su comunicación oportuna que nos permitió resolver esta situación.

En caso de requerir asistencia adicional, puede comunicarse con nuestro equipo de soporte en {correoAsignado}.

Cordialmente,

Departamento de Soporte Técnico
Insiders`,
  },
};

export const sendErrorResolutionEmail = async (
  data: ErrorResolutionEmailData
) => {
  try {
    // Determinar qué plantilla usar
    let subject = data.customSubject || templates.standard.subject;
    let content = data.customContent || templates.standard.content;

    if (data.templateType) {
      const selectedTemplate = templates[data.templateType];

      if (!data.customSubject) {
        subject = selectedTemplate.subject;
      }

      if (!data.customContent) {
        content = selectedTemplate.content;
      }
    }

    // Aplicar sustituciones para variables
    subject = subject
      .replace(/\{nombreCliente\}/g, data.fullName)
      .replace(/\{nombreArchivo\}/g, data.fileName)
      .replace(/\{fechaReporte\}/g, data.reportedAt);

    content = content
      .replace(/\{nombreCliente\}/g, data.fullName)
      .replace(/\{nombreArchivo\}/g, data.fileName)
      .replace(/\{fechaReporte\}/g, data.reportedAt)
      .replace(/\{correoAsignado\}/g, data.resolvedBy || "sistemas@insidesalons.com");

    // Enviar correo electrónico
    await emailConfig.emails.send({
      from: emailDefaults.from,
      to: [data.email],
      subject: subject,
      html: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif;">
          <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <tr>
              <td style="padding: 40px 30px; text-align: center; background-color: #4CAF50;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Resolución de Problema</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <div style="color: #666; line-height: 1.6; white-space: pre-wrap;">
                  ${content.replace(/\n/g, "<br>")}
                </div>
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

    console.info("Email de resolución enviado con éxito a:", data.email);

    return true;
  } catch (error) {
    console.error("Error al enviar el email de resolución:", error);
    throw error;
  }
};

// Exportar las plantillas para uso en la API
export const getEmailTemplates = () => {
  return Object.values(templates).map((template) => ({
    id: template.id,
    name: template.name,
    subject: template.subject,
    content: template.content,
    isDefault: template.isDefault || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};
