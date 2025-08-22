import { useMemo } from "react";
import { z } from "zod";
import { CreateSpaceSchema } from "../validations/SpaceConfigSchema";

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface RoomConfigData {
  displayName?: string;
  accessType: "OPEN" | "TRUSTED" | "RESTRICTED";
  moderation: boolean;
  members: Array<{ email: string; role: string }>;
  autoRecording: boolean;
  autoTranscription: boolean;
  autoSmartNotes: boolean;
  [key: string]: any;
}

/**
 * Hook para validar configuración de sala en tiempo real
 * Proporciona errores y advertencias específicas por campo
 */
export const useRoomValidation = (data: RoomConfigData) => {
  const validation = useMemo((): ValidationResult => {
    const errors: ValidationResult["errors"] = [];
    const warnings: ValidationResult["warnings"] = [];

    // Validar nombre de la sala
    if (data.displayName && data.displayName.trim()) {
      if (data.displayName.length < 3) {
        errors.push({
          field: "displayName",
          message: "El nombre debe tener al menos 3 caracteres",
          code: "MIN_LENGTH",
        });
      }
      
      if (data.displayName.length > 100) {
        errors.push({
          field: "displayName",
          message: "El nombre no puede tener más de 100 caracteres",
          code: "MAX_LENGTH",
        });
      }
      
      // Verificar caracteres especiales problemáticos
      if (/[<>\"'&]/.test(data.displayName)) {
        warnings.push({
          field: "displayName",
          message: "El nombre contiene caracteres que pueden causar problemas",
          code: "SPECIAL_CHARS",
        });
      }
    }

    // Validar miembros
    if (data.members && data.members.length > 0) {
      // Verificar límite de miembros
      if (data.members.length > 250) {
        errors.push({
          field: "members",
          message: "Google Meet permite máximo 250 participantes",
          code: "MAX_MEMBERS",
        });
      }
      
      // Verificar emails duplicados
      const emails = data.members.map((m) => m.email.toLowerCase());
      const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
      if (duplicates.length > 0) {
        errors.push({
          field: "members",
          message: `Emails duplicados: ${[...new Set(duplicates)].join(", ")}`,
          code: "DUPLICATE_EMAILS",
        });
      }
      
      // Validar formato de emails
      data.members.forEach((member, index) => {
        const emailValidation = z.string().email().safeParse(member.email);
        if (!emailValidation.success) {
          errors.push({
            field: `members.${index}.email`,
            message: `Email inválido: ${member.email}`,
            code: "INVALID_EMAIL",
          });
        }
      });
      
      // Advertencias para salas grandes
      if (data.members.length > 50) {
        const cohosts = data.members.filter((m) => m.role === "COHOST").length;
        if (cohosts === 0) {
          warnings.push({
            field: "members",
            message: "Se recomienda agregar co-anfitriones para salas grandes",
            code: "RECOMMEND_COHOSTS",
          });
        }
      }
    }

    // Validar configuración de acceso
    if (data.accessType === "OPEN" && data.members.length > 0) {
      warnings.push({
        field: "accessType",
        message: "Sala abierta con miembros específicos puede generar confusión",
        code: "OPEN_WITH_MEMBERS",
      });
    }

    if (data.accessType === "RESTRICTED" && data.members.length === 0) {
      warnings.push({
        field: "members",
        message: "Sala restringida sin miembros específicos puede ser inaccesible",
        code: "RESTRICTED_NO_MEMBERS",
      });
    }

    // Validar funcionalidades premium
    if (data.autoRecording || data.autoTranscription || data.autoSmartNotes) {
      if (!data.members.some((m) => m.email.includes("@"))) {
        warnings.push({
          field: "artifacts",
          message: "Las funciones automáticas requieren Google Workspace",
          code: "WORKSPACE_REQUIRED",
        });
      }
    }

    // Validar moderación
    if (data.moderation && data.members.length === 0) {
      warnings.push({
        field: "moderation",
        message: "Moderación activada sin miembros específicos",
        code: "MODERATION_NO_MEMBERS",
      });
    }

    // Validación final con schema de Zod
    try {
      const apiData = buildApiData(data);
      const schemaValidation = CreateSpaceSchema.safeParse(apiData);
      
      if (!schemaValidation.success) {
        schemaValidation.error.errors.forEach((error) => {
          errors.push({
            field: error.path.join("."),
            message: error.message,
            code: error.code,
          });
        });
      }
    } catch (schemaError) {
      errors.push({
        field: "general",
        message: "Error en validación del esquema",
        code: "SCHEMA_ERROR",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [data]);

  // Validaciones específicas por campo
  const fieldValidations = useMemo(() => {
    const getFieldErrors = (fieldName: string) =>
      validation.errors.filter((error) => error.field.startsWith(fieldName));
    
    const getFieldWarnings = (fieldName: string) =>
      validation.warnings.filter((warning) => warning.field.startsWith(fieldName));

    return {
      displayName: {
        hasErrors: getFieldErrors("displayName").length > 0,
        errors: getFieldErrors("displayName"),
        warnings: getFieldWarnings("displayName"),
      },
      members: {
        hasErrors: getFieldErrors("members").length > 0,
        errors: getFieldErrors("members"),
        warnings: getFieldWarnings("members"),
      },
      accessType: {
        hasErrors: getFieldErrors("accessType").length > 0,
        errors: getFieldErrors("accessType"),
        warnings: getFieldWarnings("accessType"),
      },
      moderation: {
        hasErrors: getFieldErrors("moderation").length > 0,
        errors: getFieldErrors("moderation"),
        warnings: getFieldWarnings("moderation"),
      },
      artifacts: {
        hasErrors: getFieldErrors("artifacts").length > 0,
        errors: getFieldErrors("artifacts"),
        warnings: getFieldWarnings("artifacts"),
      },
    };
  }, [validation]);

  return {
    validation,
    fieldValidations,
    isValid: validation.isValid,
    hasWarnings: validation.warnings.length > 0,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length,
  };
};

// Helper function para construir data de API
function buildApiData(data: RoomConfigData) {
  const config: any = {
    accessType: data.accessType,
    entryPointAccess: "ALL",
    moderation: data.moderation ? "ON" : "OFF",
  };

  if (data.moderation) {
    config.moderationRestrictions = {
      chatRestriction: "NO_RESTRICTION",
      reactionRestriction: "NO_RESTRICTION",
      presentRestriction: "NO_RESTRICTION",
      defaultJoinAsViewerType: "OFF",
    };
  }

  if (data.autoRecording || data.autoTranscription || data.autoSmartNotes) {
    config.artifactConfig = {};
    
    if (data.autoRecording) {
      config.artifactConfig.recordingConfig = {
        autoRecordingGeneration: "ON",
      };
    }
    
    if (data.autoTranscription) {
      config.artifactConfig.transcriptionConfig = {
        autoTranscriptionGeneration: "ON",
      };
    }
    
    if (data.autoSmartNotes) {
      config.artifactConfig.smartNotesConfig = {
        autoSmartNotesGeneration: "ON",
      };
    }
  }

  config.attendanceReportGenerationType = "DO_NOT_GENERATE";

  const apiData: any = {
    config,
    initialMembers: data.members || [],
  };

  if (data.displayName && data.displayName.trim()) {
    apiData.displayName = data.displayName.trim();
  }

  return apiData;
}