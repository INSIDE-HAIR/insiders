/**
 * Utilidad de logging para la aplicación
 *
 * Proporciona diferentes niveles de log y formato consistente
 */

// Nivel de log
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Configuración global del logger
export interface LoggerConfig {
  minLevel: LogLevel;
  includeTimestamp: boolean;
  includeSource: boolean;
  colorize: boolean;
}

// Configuración por defecto
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  includeTimestamp: true,
  includeSource: true,
  colorize: true,
};

// Colores ANSI para la consola
const COLORS = {
  reset: "\x1b[0m",
  debug: "\x1b[90m", // Gris
  info: "\x1b[36m", // Cyan
  warn: "\x1b[33m", // Amarillo
  error: "\x1b[31m", // Rojo
  source: "\x1b[35m", // Magenta
  time: "\x1b[32m", // Verde
};

/**
 * Clase principal para logging
 */
export class Logger {
  private source: string;
  private static config: LoggerConfig = DEFAULT_CONFIG;

  /**
   * Constructor
   * @param source Nombre del componente/módulo que utiliza este logger
   */
  constructor(source: string) {
    this.source = source;
  }

  /**
   * Configura el comportamiento global de todos los loggers
   * @param config Configuración a aplicar
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config };
  }

  /**
   * Establece el nivel mínimo de log global
   * @param level Nivel mínimo a establecer
   */
  static setLevel(level: LogLevel): void {
    Logger.config.minLevel = level;
  }

  /**
   * Log de nivel debug
   * @param message Mensaje a registrar
   * @param args Argumentos adicionales
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  /**
   * Log de nivel info
   * @param message Mensaje a registrar
   * @param args Argumentos adicionales
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  /**
   * Log de nivel warning
   * @param message Mensaje a registrar
   * @param args Argumentos adicionales
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  /**
   * Log de nivel error
   * @param message Mensaje a registrar
   * @param args Argumentos adicionales
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, args);
  }

  /**
   * Método interno para formatear y mostrar logs
   */
  private log(level: LogLevel, message: string, args: any[]): void {
    if (level < Logger.config.minLevel) return;

    let parts: string[] = [];
    const { includeTimestamp, includeSource, colorize } = Logger.config;

    // Obtener nivel como texto
    const levelText = LogLevel[level].toLowerCase();

    // Añadir timestamp si está configurado
    if (includeTimestamp) {
      const timestamp = new Date().toISOString();
      if (colorize) {
        parts.push(`${COLORS.time}${timestamp}${COLORS.reset}`);
      } else {
        parts.push(timestamp);
      }
    }

    // Añadir nivel con color apropiado
    if (colorize) {
      const color = COLORS[levelText as keyof typeof COLORS] || COLORS.reset;
      parts.push(`${color}${levelText.toUpperCase()}${COLORS.reset}`);
    } else {
      parts.push(levelText.toUpperCase());
    }

    // Añadir origen si está configurado
    if (includeSource && this.source) {
      if (colorize) {
        parts.push(`${COLORS.source}[${this.source}]${COLORS.reset}`);
      } else {
        parts.push(`[${this.source}]`);
      }
    }

    // Añadir mensaje
    parts.push(message);

    // Log a la consola
    const fullMessage = parts.join(" ");
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, ...args);
        break;
      case LogLevel.INFO:
        console.info(fullMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, ...args);
        break;
      case LogLevel.ERROR:
        console.error(fullMessage, ...args);
        break;
      default:
        console.log(fullMessage, ...args);
    }
  }
}

// Crear una instancia global para usar en toda la aplicación
export const globalLogger = new Logger("App");

// Exportar también funciones de ayuda globales
export const debug = globalLogger.debug.bind(globalLogger);
export const info = globalLogger.info.bind(globalLogger);
export const warn = globalLogger.warn.bind(globalLogger);
export const error = globalLogger.error.bind(globalLogger);
