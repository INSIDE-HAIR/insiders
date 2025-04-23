import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_LANG_CODES,
  DEFAULT_FILE_CODES,
  DEFAULT_CLIENT_CODES,
  DEFAULT_CAMPAIGN_CODES,
} from "./static-code-defaults";

const prisma = new PrismaClient();

/**
 * Mapeo común de mimeType a extensiones de archivo
 */
export const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  // Imágenes
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tiff",

  // Documentos
  "application/pdf": "pdf",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "text/plain": "txt",
  "text/html": "html",
  "text/css": "css",
  "text/javascript": "js",
  "application/json": "json",
  "application/xml": "xml",

  // Audio
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",

  // Video
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",

  // Archivos comprimidos
  "application/zip": "zip",
  "application/x-rar-compressed": "rar",
  "application/gzip": "gz",
  "application/x-7z-compressed": "7z",

  // Otros
  "application/octet-stream": "bin",
};

/**
 * Obtiene la extensión de archivo más adecuada basada en un mimeType
 * @param mimeType El tipo MIME del archivo
 * @returns La extensión correspondiente o una cadena vacía si no se puede determinar
 */
export function getExtensionFromMimeType(mimeType: string): string {
  if (!mimeType) return "";

  // Comprobar mimeType directamente
  if (MIME_TYPE_TO_EXTENSION[mimeType]) {
    return MIME_TYPE_TO_EXTENSION[mimeType];
  }

  // Para tipos genéricos como application/vnd.google-apps.xyz
  if (mimeType.includes("google-apps.presentation")) {
    return "pptx";
  } else if (mimeType.includes("google-apps.document")) {
    return "docx";
  } else if (mimeType.includes("google-apps.spreadsheet")) {
    return "xlsx";
  } else if (mimeType.includes("google-apps.drawing")) {
    return "png";
  }

  return "";
}

// Clase para manejar los códigos en la base de datos
export class CodeService {
  private static cache: Record<string, Record<string, string>> = {};
  private static cacheTimestamps: Record<string, number> = {};
  private static CACHE_EXPIRATION = 60 * 1000; // 1 minuto

  /**
   * Obtiene códigos por tipo desde la base de datos o fallback estático
   */
  public static async getCodesByType(
    type: "lang" | "file" | "client" | "campaign"
  ): Promise<Record<string, string>> {
    // Verificar cache primero
    const now = Date.now();
    if (
      this.cache[type] &&
      this.cacheTimestamps[type] &&
      now - this.cacheTimestamps[type] < this.CACHE_EXPIRATION
    ) {
      console.log(`⏩ Usando cache para códigos de tipo ${type}`);
      return this.cache[type];
    }

    console.log(`🔄 Consultando base de datos para códigos de tipo ${type}...`);

    try {
      // Intentar obtener códigos de la base de datos
      const response = await fetch(`/api/drive/codes?type=${type}`);

      if (!response.ok) {
        console.warn(
          `⚠️ Error al obtener códigos de tipo ${type} desde la API: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `Error al obtener códigos de tipo ${type}: ${response.statusText}`
        );
      }

      const codesArray = await response.json();

      if (
        !codesArray ||
        !Array.isArray(codesArray) ||
        codesArray.length === 0
      ) {
        console.warn(
          `⚠️ No se encontraron códigos de tipo ${type} en la base de datos`
        );
        throw new Error(`No se encontraron códigos de tipo ${type}`);
      }

      // Transformar el array de objetos en un objeto de código:nombre
      const codesMap: Record<string, string> = {};
      codesArray.forEach((codeObj) => {
        if (codeObj && codeObj.code && codeObj.name) {
          codesMap[codeObj.code] = codeObj.name;
        }
      });

      if (Object.keys(codesMap).length === 0) {
        console.warn(
          `⚠️ No se pudieron transformar los códigos de tipo ${type} en un mapa válido`
        );
        throw new Error(
          `No se pudieron transformar los códigos de tipo ${type}`
        );
      }

      console.log(
        `✅ Códigos de ${type} obtenidos de la base de datos:`,
        codesMap
      );

      // Actualizar cache
      this.cache[type] = codesMap;
      this.cacheTimestamps[type] = now;

      return codesMap;
    } catch (error) {
      console.error(`❌ Error consultando códigos de tipo ${type}:`, error);

      // Usar valores fallback apropiados según el tipo
      let fallbackData: Record<string, string> = {};

      switch (type) {
        case "lang":
          fallbackData = DEFAULT_LANG_CODES;
          break;
        case "file":
          fallbackData = DEFAULT_FILE_CODES;
          break;
        case "client":
          fallbackData = DEFAULT_CLIENT_CODES;
          break;
        case "campaign":
          fallbackData = DEFAULT_CAMPAIGN_CODES;
          break;
      }

      console.warn(
        `⚠️ USANDO FALLBACK ESTÁTICO para códigos de tipo ${type}:`,
        fallbackData
      );

      // Guardar fallback en cache temporalmente
      // ADVERTENCIA: Estos valores no vienen de la base de datos
      this.cache[type] = fallbackData;
      // Menor tiempo de cache para fallbacks (30 segundos) para intentar consultar BD más frecuentemente
      this.cacheTimestamps[type] = now - this.CACHE_EXPIRATION / 2;

      return fallbackData;
    }
  }

  /**
   * Limpia la caché para un tipo específico o toda la caché
   */
  public static clearCache(
    type?: "lang" | "file" | "client" | "campaign"
  ): void {
    if (type) {
      console.log(`🧹 Limpiando caché para códigos de tipo ${type}`);
      delete this.cache[type];
      delete this.cacheTimestamps[type];
    } else {
      console.log(`🧹 Limpiando toda la caché de códigos`);
      this.cache = {};
      this.cacheTimestamps = {};
    }
  }

  // Importar todos los códigos estáticos a la base de datos
  static async importAllStaticCodes(): Promise<void> {
    try {
      // Importar códigos de idioma
      const langEntries = Object.entries(DEFAULT_LANG_CODES);
      for (const [code, name] of langEntries) {
        await this.createOrUpdateCode({
          type: "lang",
          code,
          name,
          description: `Código de idioma: ${name}`,
        });
      }

      // Importar códigos de archivos
      const fileEntries = Object.entries(DEFAULT_FILE_CODES);
      for (const [code, name] of fileEntries) {
        await this.createOrUpdateCode({
          type: "file",
          code,
          name,
          description: `Tipo de archivo: ${name}`,
        });
      }

      // Importar códigos de clientes
      const clientEntries = Object.entries(DEFAULT_CLIENT_CODES);
      for (const [code, name] of clientEntries) {
        await this.createOrUpdateCode({
          type: "client",
          code,
          name,
          description: `Cliente: ${name}`,
        });
      }

      // Importar códigos de campañas
      const campaignEntries = Object.entries(DEFAULT_CAMPAIGN_CODES);
      for (const [code, name] of campaignEntries) {
        await this.createOrUpdateCode({
          type: "campaign",
          code,
          name,
          description: `Campaña: ${name}`,
        });
      }

      // Limpiar la caché después de importar
      this.clearCache();

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

      // Limpiar caché para el tipo actualizado
      this.clearCache(data.type as any);
    } catch (error) {
      console.error(
        `Error al crear/actualizar código ${data.type}:${data.code}:`,
        error
      );
      throw error;
    }
  }
}
