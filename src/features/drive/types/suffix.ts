/**
 * Sufijos utilizados para identificar tipos especiales de elementos en la jerarquía.
 * Estos sufijos determinan el comportamiento y la visualización de los elementos.
 */

/**
 * Enum con los sufijos disponibles
 */
export enum Suffix {
  // Sufijos de visibilidad
  HIDDEN = "hidden", // Elemento oculto (_hidden)

  // Sufijos de tipo
  CONFIG = "config", // Configuración (_config)
  TEMPLATE = "template", // Plantilla (_template)
  DRAFT = "draft", // Borrador (_draft)
  COPY = "copy", // Texto asociado a otro elemento (_copy)

  // Sufijos de estado
  ARCHIVED = "archived", // Elemento archivado (_archived)
  WIP = "wip", // Work in progress (_wip)

  // Sufijos de acción
  EXPORTABLE = "export", // Exportable (_export)
  SHAREABLE = "share", // Compartible (_share)
  PRINTABLE = "print", // Imprimible (_print)

  // Sufijos de estilo
  DARK = "dark", // Variante oscura (_dark)
  LIGHT = "light", // Variante clara (_light)

  // Sufijos de permisos
  ADMIN = "admin", // Solo para administradores (_admin)
  NO_DOWNLOAD = "nodownload", // No permitir descarga (_nodownload)

  // Sufijos de comportamiento
  READONLY = "readonly", // _readonly
  REQUIRED = "required", // _required

  // Sufijos de estado
  ACTIVE = "active", // _active
  INACTIVE = "inactive", // _inactive
}

/**
 * Verifica si el nombre contiene un sufijo específico
 * @param name Nombre a verificar
 * @param suffix Sufijo a buscar
 */
export function hasSuffix(name: string, suffix: Suffix): boolean {
  return name.includes(`_${suffix}`);
}

/**
 * Elimina el sufijo de un nombre
 * @param name Nombre completo con sufijo
 * @param suffix Sufijo a eliminar
 * @returns Nombre sin el sufijo
 */
export function removeSuffix(name: string, suffix: Suffix): string {
  return name.replace(`_${suffix}`, "");
}

/**
 * Extrae todos los sufijos de un nombre
 * @param name Nombre completo con posibles sufijos
 * @returns Array con los sufijos encontrados
 */
export function extractAllSuffixes(name: string): Suffix[] {
  const suffixes: Suffix[] = [];

  // Comprobar cada sufijo en el enum
  Object.values(Suffix).forEach((suffix) => {
    if (name.endsWith(`_${suffix}`)) {
      suffixes.push(suffix as Suffix);
    }
  });

  return suffixes;
}

/**
 * Extrae sufijos de un nombre
 * @param name Nombre a analizar
 */
export function extractSuffixes(name: string): {
  suffixes: Suffix[];
  displayName: string;
} {
  const suffixes: Suffix[] = [];
  let displayName = name;

  // Detectar todos los sufijos posibles
  Object.values(Suffix).forEach((suffix) => {
    if (hasSuffix(name, suffix)) {
      suffixes.push(suffix);
      displayName = removeSuffix(displayName, suffix);
    }
  });

  return { suffixes, displayName };
}
