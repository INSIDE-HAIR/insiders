/**
 * Prefijos utilizados para identificar tipos especiales de elementos en la jerarquía.
 * Estos prefijos determinan el comportamiento y la visualización de los elementos.
 */

/**
 * Enum con los prefijos disponibles
 */
export enum Prefix {
  // Prefijos descriptivos
  CAMPAIGN = "campaign", // Campaña (_campaign)
  YEAR = "year", // Año (_year)
  CLIENT = "client", // Cliente (_client)
  // Prefijo de orden númerico
  ORDER = "order", // Prefijo numérico para ordenamiento (01_, 02_, etc.)

  // Prefijos para componentes UI
  TABS = "tabs", // Contenedor de tabs (tabs_)
  TAB = "tab", // Tab individual (tab_)
  ACCORDION = "accordion", // Acordeón (accordion_)
  SECTION = "section", // Sección (section_)
  GRID = "grid", // Grid (grid_)
  CARD = "card", // Tarjeta (card_)
  SIDEBAR = "sidebar", // Barra lateral (sidebar_)  

  // Prefijos para metadatos
  META = "meta", // Metadatos (meta_)
  CONFIG = "config", // Configuración (config_)

  // Prefijos para tipos de contenido
  VIDEO = "video", // Video (video_)
  AUDIO = "audio", // Audio (audio_)
  IMAGE = "image", // Imagen (image_)
  DOCUMENT = "doc", // Documento (doc_)

  // Prefijos adicionales
  EMBED = "embed", // Contenido embebido (embed_)
  BUTTON = "button", // Botón (button_)
  MODAL = "modal", // Modal (modal_)
}

/**
 * Verifica si el nombre contiene un prefijo específico
 * @param name Nombre a verificar
 * @param prefix Prefijo a buscar
 */
export function hasPrefix(name: string, prefix: Prefix): boolean {
  return name.includes(`${prefix}_`);
}

/**
 * Elimina el prefijo de un nombre
 * @param name Nombre completo con prefijo
 * @param prefix Prefijo a eliminar
 * @returns Nombre sin el prefijo
 */
export function removePrefix(name: string, prefix: Prefix): string {
  const prefixStr = `${prefix}_`;
  if (name.includes(prefixStr)) {
    return name.replace(prefixStr, "");
  }
  return name;
}

/**
 * Extrae el prefijo numérico de un nombre (si existe)
 * @param name Nombre con posible prefijo numérico (ej: "01_nombre")
 * @returns El prefijo numérico o null si no existe
 */
export function extractNumericPrefix(name: string): number | null {
  const match = name.match(/^(\d+)_/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Extrae prefijos de un nombre
 * @param name Nombre a analizar
 */
export function extractPrefixes(name: string): {
  prefixes: Prefix[];
  order: number;
  displayName: string;
} {
  const prefixes: Prefix[] = [];
  let displayName = name;
  let order = 0;

  // Detectar prefijos numéricos (01_, 02_, etc.)
  const orderMatch = name.match(/^(\d+)_/);
  if (orderMatch) {
    order = parseInt(orderMatch[1], 10);
    prefixes.push(Prefix.ORDER);
    displayName = displayName.replace(/^\d+_/, "");
  }

  // Detectar prefijos de componente (tabs_, section_, etc.)
  Object.values(Prefix).forEach((prefix) => {
    if (prefix !== Prefix.ORDER && name.includes(`${prefix}_`)) {
      prefixes.push(prefix as Prefix);
      displayName = displayName.replace(`${prefix}_`, "");
    }
  });

  return { prefixes, order, displayName };
}
