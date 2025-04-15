import { PrismaClient } from "@prisma/client";
import {
  langCodes,
  filesCodes,
  clientsCodes,
  campaignCodes,
} from "./file-decoder";

const prisma = new PrismaClient();

// Clase para manejar los códigos en la base de datos
export class CodeService {
  // Obtener todos los códigos de un tipo específico
  static async getCodesByType(
    type: "lang" | "file" | "client" | "campaign"
  ): Promise<Record<string, string>> {
    try {
      const codes = await prisma.code.findMany({
        where: { type },
        orderBy: { code: "asc" },
      });

      // Convertir a formato clave-valor
      const codeMap: Record<string, string> = {};
      codes.forEach((code) => {
        codeMap[code.code] = code.name;
      });

      return codeMap;
    } catch (error) {
      console.error(`Error al obtener códigos de tipo ${type}:`, error);

      // Retornar los códigos estáticos como fallback
      switch (type) {
        case "lang":
          return langCodes;
        case "file":
          return filesCodes;
        case "client":
          return clientsCodes;
        case "campaign":
          return campaignCodes;
        default:
          return {};
      }
    }
  }

  // Importar todos los códigos estáticos a la base de datos
  static async importAllStaticCodes(): Promise<void> {
    try {
      // Importar códigos de idioma
      const langEntries = Object.entries(langCodes);
      for (const [code, name] of langEntries) {
        await this.createOrUpdateCode({
          type: "lang",
          code,
          name,
          description: `Código de idioma: ${name}`,
        });
      }

      // Importar códigos de archivos
      const fileEntries = Object.entries(filesCodes);
      for (const [code, name] of fileEntries) {
        await this.createOrUpdateCode({
          type: "file",
          code,
          name,
          description: `Tipo de archivo: ${name}`,
        });
      }

      // Importar códigos de clientes
      const clientEntries = Object.entries(clientsCodes);
      for (const [code, name] of clientEntries) {
        await this.createOrUpdateCode({
          type: "client",
          code,
          name,
          description: `Cliente: ${name}`,
        });
      }

      // Importar códigos de campañas
      const campaignEntries = Object.entries(campaignCodes);
      for (const [code, name] of campaignEntries) {
        await this.createOrUpdateCode({
          type: "campaign",
          code,
          name,
          description: `Campaña: ${name}`,
        });
      }

      console.log("Importación de códigos completada con éxito");
    } catch (error) {
      console.error("Error al importar códigos:", error);
      throw error;
    }
  }

  // Crear o actualizar un código
  private static async createOrUpdateCode(data: {
    type: string;
    code: string;
    name: string;
    description?: string;
  }): Promise<void> {
    try {
      // Verificar si ya existe
      const existing = await prisma.code.findFirst({
        where: {
          type: data.type,
          code: data.code,
        },
      });

      if (existing) {
        // Actualizar
        await prisma.code.update({
          where: { id: existing.id },
          data: {
            name: data.name,
            description: data.description,
          },
        });
      } else {
        // Crear nuevo
        await prisma.code.create({
          data: {
            type: data.type,
            code: data.code,
            name: data.name,
            description: data.description,
          },
        });
      }
    } catch (error) {
      console.error(
        `Error al crear/actualizar código ${data.type}:${data.code}:`,
        error
      );
      throw error;
    }
  }
}
 