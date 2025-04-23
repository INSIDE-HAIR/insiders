import { CodeService } from "./file-decoder-service";
import {
  DEFAULT_LANG_CODES,
  DEFAULT_FILE_CODES,
  DEFAULT_CLIENT_CODES,
  DEFAULT_CAMPAIGN_CODES,
  MONTH_NAMES,
} from "./static-code-defaults";
import { getExtensionFromMimeType } from "./file-decoder-service";

export interface DecodedFile {
  client: string;
  campaign: string;
  category: string;
  lang: string;
  version: string;
  fullName: string;
  year: string;
  month: string;
}

/**
 * Decodifica de forma asíncrona el nombre de un archivo obtieniendo los valores de códigos desde la base de datos
 * @param fileName Nombre del archivo a decodificar
 * @param mimeType Tipo MIME del archivo (opcional)
 * @returns Objeto con información decodificada o null si no se pudo decodificar
 */
export async function decodeFileNameAsync(
  fileName: string,
  mimeType?: string
): Promise<DecodedFile | null> {
  console.log(`🔍 Decodificando nombre de archivo (ASYNC): ${fileName}`);

  try {
    // Eliminar "Copia de " si existe al principio
    const cleanName = fileName.replace(/^Copia de /, "");

    // Buscar coincidencia con el patrón CLIENTE-CAMPAÑA-AÑOMES-CATEGORIA-GRUPO-VERSION
    // Ejemplo: A-A-2505-0080-01-00-02
    const match = cleanName.match(
      /([A-Z])-([A-Z])-(\d{4})-(\d{4})-(\d{2})-(\d{2})-(\d{2})(?:-P\d+)?/
    );

    if (!match) {
      console.log(`⚠️ Patrón no coincide para archivo: ${cleanName}`);
      return null;
    }

    const [
      _,
      clientCode, // A: Código del cliente
      campaignCode, // A: Código de la campaña
      yearMonthCode, // 2505: Año (25) y mes (05)
      categoryCode, // 0080: Código de categoría/tipo de archivo
      langCode, // 01: Código de idioma/grupo
      positionCode, // 00: Posición (generalmente no usado)
      versionCode, // 02: Versión
    ] = match;

    console.log(
      `🔢 Códigos extraídos: Client=${clientCode}, Campaign=${campaignCode}, YearMonth=${yearMonthCode}, Category=${categoryCode}, Lang=${langCode}, Position=${positionCode}, Version=${versionCode}`
    );

    // Obtener datos de BD para cada tipo de código
    const [langCodes, fileCodes, clientCodes, campaignCodes] =
      await Promise.all([
        CodeService.getCodesByType("lang"),
        CodeService.getCodesByType("file"),
        CodeService.getCodesByType("client"),
        CodeService.getCodesByType("campaign"),
      ]);

    // Extraer año y mes del código
    const yearCode = yearMonthCode.substring(0, 2);
    const monthCode = yearMonthCode.substring(2, 4);
    const year = `20${yearCode}`;

    // Obtener nombre del mes
    const monthNumber = parseInt(monthCode, 10);
    const monthName =
      monthNumber >= 1 && monthNumber <= 12
        ? (MONTH_NAMES as Record<string, string>)[
            monthNumber.toString().padStart(2, "0")
          ]
        : monthCode;

    // Registrar si un valor se encuentra en la BD o se usa fallback
    let clientName: string;
    if (clientCode in clientCodes) {
      clientName = clientCodes[clientCode];
      console.log(`✅ Cliente encontrado en BD: ${clientCode} = ${clientName}`);
    } else {
      clientName =
        (DEFAULT_CLIENT_CODES as Record<string, string>)[clientCode] ||
        clientCode;
      console.log(
        `⚠️ FALLBACK de cliente (no encontrado en BD): ${clientCode} = ${clientName}`
      );
    }

    let campaignName: string;
    if (campaignCode in campaignCodes) {
      campaignName = campaignCodes[campaignCode];
      console.log(
        `✅ Campaña encontrada en BD: ${campaignCode} = ${campaignName}`
      );
    } else {
      campaignName =
        (DEFAULT_CAMPAIGN_CODES as Record<string, string>)[campaignCode] ||
        campaignCode;
      console.log(
        `⚠️ FALLBACK de campaña (no encontrada en BD): ${campaignCode} = ${campaignName}`
      );
    }

    let categoryName: string;
    if (categoryCode in fileCodes) {
      categoryName = fileCodes[categoryCode];
      console.log(
        `✅ Categoría encontrada en BD: ${categoryCode} = ${categoryName}`
      );
    } else {
      categoryName =
        (DEFAULT_FILE_CODES as Record<string, string>)[categoryCode] ||
        categoryCode;
      console.log(
        `⚠️ FALLBACK de categoría (no encontrada en BD): ${categoryCode} = ${categoryName}`
      );
    }

    let langName: string;
    if (langCode in langCodes) {
      langName = langCodes[langCode];
      console.log(`✅ Idioma encontrado en BD: ${langCode} = ${langName}`);
    } else {
      langName =
        (DEFAULT_LANG_CODES as Record<string, string>)[langCode] || langCode;
      console.log(
        `⚠️ FALLBACK de idioma (no encontrado en BD): ${langCode} = ${langName}`
      );
    }

    // Extraer la extensión del archivo original de manera más robusta
    let extension = "";
    const fileNameParts = cleanName.split(".");
    if (fileNameParts.length > 1) {
      extension = fileNameParts.pop() || "";
      // Verificar que sea una extensión válida (solo caracteres alfanuméricos, entre 1-10 caracteres)
      if (!/^[a-zA-Z0-9]{1,10}$/.test(extension)) {
        extension = "";
      }
    }

    // Si no se encontró extensión en el nombre y se proporcionó mimeType, intentar obtenerla del mimeType
    if (!extension && mimeType) {
      extension = getExtensionFromMimeType(mimeType);
      console.log(
        `📄 Extensión obtenida del mimeType (${mimeType}): ${
          extension || "ninguna"
        }`
      );
    } else {
      console.log(
        `📄 Extensión detectada del nombre: ${extension || "ninguna"}`
      );
    }

    // Armar información decodificada
    const result: DecodedFile = {
      client: clientName,
      campaign: campaignName,
      category: categoryName,
      lang: langName,
      version: versionCode,
      fullName: `${clientName}-${campaignName}-${year}-${monthName}-${categoryName}-${langName}-v${versionCode}${
        extension ? "." + extension : ""
      }`,
      year,
      month: monthName,
    };

    console.log(`✅ Decodificación exitosa (ASYNC):`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error en decodificación asíncrona:`, error);

    // Intentar fallback a decodificación sincrónica
    console.log(`⚠️ Intentando fallback a decodificación sincrónica...`);
    try {
      return decodeFileName(fileName);
    } catch (fallbackError) {
      console.error(`❌ Fallo completo en decodificación:`, fallbackError);
      return null;
    }
  }
}

/**
 * Mantener la función sincrónica como fallback
 * IMPORTANTE: Esta función solo debe usarse como último recurso
 * cuando decodeFileNameAsync falla o cuando es estrictamente necesario
 * un comportamiento sincrónico
 */
export function decodeFileName(fileName: string): DecodedFile | null {
  // Si el nombre está vacío, retornar null inmediatamente
  if (!fileName) return null;

  try {
    // Eliminar "Copia de " si existe
    const cleanName = fileName.replace(/^Copia de /, "");

    // Intentar extraer el código del formato CLIENTE-CAMPAÑA-AÑOMES-CATEGORIA-GRUPO-VERSION
    // Ejemplo: A-A-2505-0080-01-00-02
    const regex =
      /([A-Z])-([A-Z])-(\d{4})-(\d{4})-(\d{2})-(\d{2})-(\d{2})(?:-P\d+)?/;
    const match = cleanName.match(regex);

    if (!match) return null;

    const [
      ,
      clientCode, // A: Código del cliente
      campaignCode, // A: Código de la campaña
      yearMonthCode, // 2505: Año (25) y mes (05)
      categoryCode, // 0080: Código de categoría/tipo de archivo
      langCode, // 01: Código de idioma/grupo
      positionCode, // 00: Posición (generalmente no usado)
      versionCode, // 02: Versión
    ] = match;

    // Buscar nombres desde los códigos usando los valores estáticos como fallback
    const client =
      DEFAULT_CLIENT_CODES[clientCode as keyof typeof DEFAULT_CLIENT_CODES] ||
      clientCode;
    const campaign =
      DEFAULT_CAMPAIGN_CODES[
        campaignCode as keyof typeof DEFAULT_CAMPAIGN_CODES
      ] || campaignCode;
    const category =
      DEFAULT_FILE_CODES[categoryCode as keyof typeof DEFAULT_FILE_CODES] ||
      categoryCode;
    const lang =
      DEFAULT_LANG_CODES[langCode as keyof typeof DEFAULT_LANG_CODES] ||
      langCode;

    // Extraer año y mes del código
    const year = "20" + yearMonthCode.substring(0, 2);
    const month = yearMonthCode.substring(2, 4);

    // Obtener nombre del mes
    const monthName = MONTH_NAMES[month as keyof typeof MONTH_NAMES] || month;

    // Extraer la extensión del archivo original
    const extension = fileName.split(".").pop() || "";

    // Crear un nombre de archivo más descriptivo para la descarga
    const downloadName = `${client}-${campaign}-${year}-${monthName}-${category}-${lang}-v${versionCode}${
      extension ? "." + extension : ""
    }`;

    return {
      client,
      campaign,
      category,
      lang,
      version: versionCode,
      fullName: downloadName,
      year,
      month: monthName,
    };
  } catch (error) {
    console.error("Error en decodificación sincrónica:", error);
    return null;
  }
}
