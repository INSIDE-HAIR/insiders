import {
  clientsCodes,
  campaignCodes,
  filesCodes,
  langCodes,
} from "@/db/constants";

interface FileInfo {
  clientCode: string;
  clientName: string;
  campaignCode: string;
  campaignName: string;
  yearMonth: string;
  year: string;
  month: string;
  fileCode: string;
  fileType: string;
  langCode: string;
  language: string;
  family?: string;
  version?: string;
  fullDescription: string;
}

/**
 * Analiza el nombre de un archivo para extraer información descriptiva
 * basada en las constantes definidas en db/constants.ts
 *
 * Formato esperado del nombre: CCCC-CCCC-YYMM-FFFF-LL-V donde:
 * - CCCC: Código del cliente (ej: A123)
 * - CCCC: Código de campaña (ej: B456)
 * - YYMM: Año y mes (ej: 2505 para mayo 2025)
 * - FFFF: Código del tipo de archivo (ej: 0080 para Cartel 80x120cm)
 * - LL: Código de idioma (ej: 01 para Español)
 * - F: Familia (opcional)
 * - V: Versión (opcional)
 */
export function analyzeFileName(fileName: string): FileInfo | null {
  try {
    // Eliminar extensión si existe
    const nameWithoutExtension = fileName.includes(".")
      ? fileName.substring(0, fileName.lastIndexOf("."))
      : fileName;

    // Extraer el patrón de codificación usando expresión regular
    // Busca un patrón de letras/números seguidos de guiones que parezca un código de archivo
    const codePattern =
      /([A-Z0-9]+-[A-Z0-9]+-\d{4}-\d{4}-\d{2}(?:-\d{2})?(?:-\d{2})?(?:-P\d+)?)/i;
    const match = nameWithoutExtension.match(codePattern);

    let codeString = "";
    if (match && match[1]) {
      // Extraemos solo la parte que coincide con el patrón de código
      codeString = match[1];
    } else {
      // Eliminar prefijos comunes como "Copia de", "Copy of", etc.
      const cleanName = nameWithoutExtension
        .replace(/^(Copy of |Copia de |copia de |copy of )/i, "")
        .trim();

      // Dividir por separadores comunes
      codeString = cleanName;
    }

    // Dividir la cadena de código en sus partes
    const parts = codeString.split(/[-_]/);

    // Verificar si tenemos suficientes partes para el análisis
    if (parts.length < 5) {
      console.warn(
        `El nombre del archivo no tiene el formato esperado: ${fileName}. Cadena de código extraída: ${codeString}`
      );
      return null;
    }

    // Si el código tiene formato A-A-2501-0002-01-00-01-P1, extraer componentes principales
    // ignorando la parte -P1 si existe (que indica que es una vista previa)
    let mainParts = [...parts];
    const isPreview = parts.some(
      (part) => part.startsWith("P") && /^\d+$/.test(part.substring(1))
    );

    const [
      clientCode,
      campaignCode,
      yearMonth,
      fileCode,
      langCode,
      family,
      version,
    ] = mainParts;

    // Extraer año y mes del código YYMM
    const year = yearMonth?.substring(0, 2) || "";
    const month = yearMonth?.substring(2, 4) || "";

    // Obtener nombres descriptivos de los códigos
    const clientName =
      clientsCodes[clientCode?.substring(0, 1) as keyof typeof clientsCodes] ||
      "Desconocido";
    const campaignName =
      campaignCodes[
        campaignCode?.substring(0, 1) as keyof typeof campaignCodes
      ] || "Desconocido";
    const fileType =
      filesCodes[fileCode?.substring(0, 4) as keyof typeof filesCodes] ||
      "Desconocido";
    const language =
      langCodes[langCode as keyof typeof langCodes] || "Desconocido";

    // Construir descripción completa
    const fullDescription = `
      Cliente: ${clientName} (${clientCode})
      Campaña: ${campaignName} (${campaignCode})
      Fecha: 20${year}/${month}
      Tipo: ${fileType} (${fileCode})
      Idioma: ${language} (${langCode})
      ${family ? `Familia: ${family}` : ""}
      ${version ? `Versión: ${version}` : ""}
    `.trim();

    return {
      clientCode,
      clientName,
      campaignCode,
      campaignName,
      yearMonth,
      year,
      month,
      fileCode,
      fileType,
      langCode,
      language,
      family,
      version,
      fullDescription,
    };
  } catch (error) {
    console.error(`Error analizando nombre de archivo: ${fileName}`, error);
    return null;
  }
}
