/**
 * Calendar Environment Variables Validator
 * 
 * Validates and provides detailed information about
 * Google Calendar API environment variables configuration
 */

import { Logger } from "../../utils/logger";

const logger = new Logger("CalendarEnvValidator");

export interface EnvVarStatus {
  name: string;
  displayName: string;
  value: string | null;
  isSet: boolean;
  isValid: boolean;
  required: boolean;
  error?: string;
  description: string;
  example: string;
}

export interface CalendarEnvValidation {
  isFullyConfigured: boolean;
  hasMinimumConfig: boolean;
  missingRequired: string[];
  invalidVariables: string[];
  variables: EnvVarStatus[];
  summary: {
    total: number;
    configured: number;
    valid: number;
    missing: number;
  };
}

export class CalendarEnvValidator {
  private static readonly ENV_VARIABLES = {
    GOOGLE_CALENDAR_CLIENT_ID: {
      displayName: "Client ID",
      required: true,
      description: "ID público del cliente OAuth2 de Google Cloud Console",
      example: "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
      validator: (value: string) => {
        if (!value) return "Client ID es requerido";
        if (!value.includes('.apps.googleusercontent.com')) {
          return "Client ID debe terminar en '.apps.googleusercontent.com'";
        }
        if (value.length < 50) return "Client ID parece demasiado corto";
        return null;
      }
    },
    GOOGLE_CALENDAR_CLIENT_SECRET: {
      displayName: "Client Secret",
      required: true,
      description: "Secreto privado del cliente OAuth2 de Google Cloud Console",
      example: "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",
      validator: (value: string) => {
        if (!value) return "Client Secret es requerido";
        if (!value.startsWith('GOCSPX-')) {
          return "Client Secret debe comenzar con 'GOCSPX-'";
        }
        if (value.length < 30) return "Client Secret parece demasiado corto";
        return null;
      }
    },
    GOOGLE_CALENDAR_REFRESH_TOKEN: {
      displayName: "Refresh Token",
      required: true,
      description: "Token para renovar acceso automáticamente desde OAuth2 Playground",
      example: "1//0abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      validator: (value: string) => {
        if (!value) return "Refresh Token es requerido";
        if (!value.startsWith('1//')) {
          return "Refresh Token debe comenzar con '1//'";
        }
        if (value.length < 50) return "Refresh Token parece demasiado corto";
        return null;
      }
    },
    GOOGLE_CALENDAR_REDIRECT_URI: {
      displayName: "Redirect URI",
      required: true,
      description: "URL de callback después de autorización (requerida para OAuth2)",
      example: "http://localhost:3000/api/calendar/auth/callback",
      validator: (value: string) => {
        if (!value) return "Redirect URI es requerida para OAuth2";
        try {
          new URL(value);
          return null;
        } catch {
          return "Redirect URI debe ser una URL válida";
        }
      }
    },
    GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID: {
      displayName: "Default Calendar ID",
      required: false,
      description: "ID del calendario por defecto (opcional, default: 'primary')",
      example: "primary",
      validator: (value: string) => {
        // Siempre válido ya que es opcional
        return null;
      }
    },
    GOOGLE_CALENDAR_DEFAULT_TIMEZONE: {
      displayName: "Default Timezone",
      required: false,
      description: "Zona horaria por defecto (opcional, default: 'Europe/Madrid')",
      example: "Europe/Madrid",
      validator: (value: string) => {
        if (!value) return null; // Opcional
        // Validación básica de timezone
        const validTimezones = Intl.supportedValuesOf?.('timeZone') || [];
        if (validTimezones.length > 0 && !validTimezones.includes(value)) {
          return "Timezone no reconocida";
        }
        return null;
      }
    }
  };

  /**
   * Valida todas las variables de entorno de Calendar
   */
  public static validateEnvironment(): CalendarEnvValidation {
    logger.info("Validating Calendar environment variables");

    const variables: EnvVarStatus[] = [];
    const missingRequired: string[] = [];
    const invalidVariables: string[] = [];

    // Evaluar cada variable
    Object.entries(this.ENV_VARIABLES).forEach(([envName, config]) => {
      const value = process.env[envName] || null;
      const isSet = value !== null && value !== "";
      
      let isValid = true;
      let error: string | undefined;

      if (config.required && !isSet) {
        isValid = false;
        error = `${config.displayName} es obligatorio`;
        missingRequired.push(envName);
      } else if (isSet && config.validator) {
        const validationError = config.validator(value!);
        if (validationError) {
          isValid = false;
          error = validationError;
          invalidVariables.push(envName);
        }
      }

      variables.push({
        name: envName,
        displayName: config.displayName,
        value: isSet ? this.maskSensitiveValue(envName, value!) : null,
        isSet,
        isValid,
        required: config.required,
        error,
        description: config.description,
        example: config.example
      });
    });

    // Calcular estadísticas
    const configured = variables.filter(v => v.isSet).length;
    const valid = variables.filter(v => v.isValid).length;
    const missing = variables.filter(v => v.required && !v.isSet).length;

    const hasMinimumConfig = missingRequired.length === 0;
    const isFullyConfigured = hasMinimumConfig && invalidVariables.length === 0;

    const validation: CalendarEnvValidation = {
      isFullyConfigured,
      hasMinimumConfig,
      missingRequired,
      invalidVariables,
      variables,
      summary: {
        total: variables.length,
        configured,
        valid,
        missing
      }
    };

    logger.info(`Environment validation completed: ${isFullyConfigured ? 'VALID' : 'INVALID'}`);
    
    if (!isFullyConfigured) {
      logger.warn(`Missing required: [${missingRequired.join(', ')}]`);
      logger.warn(`Invalid variables: [${invalidVariables.join(', ')}]`);
    }

    return validation;
  }

  /**
   * Obtiene el estado de una variable específica
   */
  public static getVariableStatus(envName: string): EnvVarStatus | null {
    const config = this.ENV_VARIABLES[envName as keyof typeof this.ENV_VARIABLES];
    if (!config) return null;

    const value = process.env[envName] || null;
    const isSet = value !== null && value !== "";
    
    let isValid = true;
    let error: string | undefined;

    if (config.required && !isSet) {
      isValid = false;
      error = `${config.displayName} es obligatorio`;
    } else if (isSet && config.validator) {
      const validationError = config.validator(value!);
      if (validationError) {
        isValid = false;
        error = validationError;
      }
    }

    return {
      name: envName,
      displayName: config.displayName,
      value: isSet ? this.maskSensitiveValue(envName, value!) : null,
      isSet,
      isValid,
      required: config.required,
      error,
      description: config.description,
      example: config.example
    };
  }

  /**
   * Enmascara valores sensibles para logging seguro
   */
  private static maskSensitiveValue(envName: string, value: string): string {
    const sensitiveVars = [
      'GOOGLE_CALENDAR_CLIENT_SECRET',
      'GOOGLE_CALENDAR_REFRESH_TOKEN'
    ];

    if (sensitiveVars.includes(envName)) {
      if (value.length <= 8) return '***';
      return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
    }

    return value;
  }

  /**
   * Genera reporte detallado para debugging
   */
  public static generateReport(): string {
    const validation = this.validateEnvironment();
    
    let report = "\n=== CALENDAR ENVIRONMENT VARIABLES REPORT ===\n\n";
    
    // Estado general
    report += `Estado General: ${validation.isFullyConfigured ? '✅ CONFIGURADO' : '❌ INCOMPLETO'}\n`;
    report += `Configuración Mínima: ${validation.hasMinimumConfig ? '✅ SÍ' : '❌ NO'}\n`;
    report += `Variables: ${validation.summary.configured}/${validation.summary.total} configuradas\n`;
    report += `Válidas: ${validation.summary.valid}/${validation.summary.total}\n\n`;

    // Variables faltantes
    if (validation.missingRequired.length > 0) {
      report += "❌ VARIABLES OBLIGATORIAS FALTANTES:\n";
      validation.missingRequired.forEach(varName => {
        report += `  • ${varName}\n`;
      });
      report += "\n";
    }

    // Variables inválidas
    if (validation.invalidVariables.length > 0) {
      report += "⚠️ VARIABLES CON ERRORES:\n";
      validation.variables
        .filter(v => !v.isValid)
        .forEach(variable => {
          report += `  • ${variable.name}: ${variable.error}\n`;
        });
      report += "\n";
    }

    // Detalle de todas las variables
    report += "📋 DETALLE DE VARIABLES:\n";
    validation.variables.forEach(variable => {
      const status = variable.isValid ? '✅' : (variable.required ? '❌' : '⚠️');
      const value = variable.isSet ? variable.value : 'NO CONFIGURADA';
      
      report += `  ${status} ${variable.name} (${variable.required ? 'OBLIGATORIO' : 'OPCIONAL'})\n`;
      report += `     Valor: ${value}\n`;
      if (variable.error) {
        report += `     Error: ${variable.error}\n`;
      }
      report += `     Descripción: ${variable.description}\n\n`;
    });

    return report;
  }

  /**
   * Valida si se puede conectar a Google Calendar API
   */
  public static canConnectToAPI(): { canConnect: boolean; reason?: string } {
    const validation = this.validateEnvironment();
    
    if (!validation.hasMinimumConfig) {
      return {
        canConnect: false,
        reason: `Variables obligatorias faltantes: ${validation.missingRequired.join(', ')}`
      };
    }

    if (validation.invalidVariables.length > 0) {
      return {
        canConnect: false,
        reason: `Variables inválidas: ${validation.invalidVariables.join(', ')}`
      };
    }

    return { canConnect: true };
  }
}