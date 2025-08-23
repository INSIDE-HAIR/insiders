/**
 * UTILIDADES DE COLOR PARA TAGS Y GRUPOS
 * Genera estilos dinámicos basados en colores hex
 * Patrón: fondo claro, letra oscura, border oscuro
 * 
 * @author Claude Code
 * @version 1.0.0
 */

/**
 * Convierte hex a RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result && result[1] && result[2] && result[3] ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Oscurece un color hex
 */
function darkenHex(hex: string, amount: number = 0.3): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const darken = (value: number) => Math.max(0, Math.floor(value * (1 - amount)));
  
  return `#${[darken(rgb.r), darken(rgb.g), darken(rgb.b)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Aclara un color hex (ajustado para mejor contraste visual)
 */
function lightenHex(hex: string, amount: number = 0.15): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const lighten = (value: number) => Math.min(255, Math.floor(value + (255 - value) * amount));
  
  return `#${[lighten(rgb.r), lighten(rgb.g), lighten(rgb.b)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Genera estilos CSS para tags/grupos con colores dinámicos
 * Patrón: fondo de color vibrante, letra oscura/blanca, border del color principal
 */
export function generateColorStyles(baseColor: string) {
  // Para coincidir con el diseño de referencia: colores más vibrantes
  const lightBg = lightenHex(baseColor, 0.15);  // Fondo ligeramente más claro (15% hacia blanco)
  const darkText = darkenHex(baseColor, 0.65);  // Letra muy oscura (65% más oscura) o blanca si es muy claro
  const mediumBorder = darkenHex(baseColor, 0.1); // Border ligeramente más oscuro (10%)
  
  // Determinar si usar texto blanco para colores muy oscuros
  const rgb = hexToRgb(baseColor);
  const brightness = rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 : 128;
  const textColor = brightness < 150 ? '#FFFFFF' : darkText;
  
  return {
    backgroundColor: lightBg,
    color: textColor,
    borderColor: mediumBorder,
    // Estilos CSS string para usar con style attribute
    cssString: `background-color: ${lightBg}; color: ${textColor}; border-color: ${mediumBorder};`,
    // Clases dinámicas para Tailwind (usando variables CSS)
    cssVariables: {
      '--tag-bg': lightBg,
      '--tag-text': textColor,
      '--tag-border': mediumBorder,
    }
  };
}

/**
 * Estilos específicos para tags
 */
export function generateTagStyles(color: string) {
  return generateColorStyles(color);
}

/**
 * Estilos específicos para grupos
 */
export function generateGroupStyles(color: string) {
  return generateColorStyles(color);
}

/**
 * Genera clase CSS dinámica
 */
export function generateDynamicClassName(color: string, prefix: string = 'dynamic') {
  // Reemplazar # y generar nombre único
  const colorId = color.replace('#', '').toLowerCase();
  return `${prefix}-${colorId}`;
}

/**
 * Paleta de colores variados inspirada en el diseño mostrado
 * Incluye rosas, azules, verdes y otros colores vibrantes
 */
export const THEME_COLORS = {
  // Colores principales rosa/magenta
  primary: '#E91E63',      // Rosa vibrante
  primaryDark: '#AD1457',  // Rosa oscuro
  primaryLight: '#F8BBD9', // Rosa claro
  
  // Variaciones magenta
  magenta: '#C2185B',      // Magenta principal
  magentaDark: '#880E4F',  // Magenta oscuro
  magentaLight: '#F48FB1', // Magenta claro
  
  // Colores de acento
  accent: '#FF4081',       // Acento rosa brillante
  accentDark: '#C51162',   // Acento oscuro
  accentLight: '#FF80AB',  // Acento claro
  
  // Paleta extendida para variedad visual
  blue: '#2196F3',         // Azul vibrante
  green: '#4CAF50',        // Verde vibrante  
  orange: '#FF9800',       // Naranja vibrante
  purple: '#9C27B0',       // Púrpura vibrante
  teal: '#009688',         // Verde azulado
  indigo: '#3F51B5',       // Índigo
};

/**
 * Genera estilos usando la paleta tema rosa/magenta
 */
export function generateThemeColorStyles(baseColor?: string) {
  // Si no se proporciona color, usar paleta tema
  if (!baseColor || !baseColor.startsWith('#')) {
    return {
      backgroundColor: THEME_COLORS.primaryLight,
      color: THEME_COLORS.primaryDark,
      borderColor: THEME_COLORS.primary,
      cssString: `background-color: ${THEME_COLORS.primaryLight}; color: ${THEME_COLORS.primaryDark}; border-color: ${THEME_COLORS.primary};`,
      cssVariables: {
        '--tag-bg': THEME_COLORS.primaryLight,
        '--tag-text': THEME_COLORS.primaryDark,
        '--tag-border': THEME_COLORS.primary,
      }
    };
  }
  
  // Si se proporciona color, generar variaciones
  return generateColorStyles(baseColor);
}

/**
 * Hook para usar colores dinámicos en componentes React
 */
export function useColorStyles(color?: string) {
  if (!color || !color.startsWith('#')) {
    // Color por defecto usando paleta tema
    return generateThemeColorStyles('#E91E63'); // Rosa principal
  }
  
  return generateColorStyles(color);
}

/**
 * Hook específico para tema rosa/magenta
 */
export function useThemeColors() {
  return {
    primary: generateColorStyles(THEME_COLORS.primary),
    magenta: generateColorStyles(THEME_COLORS.magenta),
    accent: generateColorStyles(THEME_COLORS.accent),
    colors: THEME_COLORS
  };
}