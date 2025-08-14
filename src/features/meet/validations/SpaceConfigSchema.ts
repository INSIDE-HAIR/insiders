import { z } from "zod";

// Enums oficiales de Meet API
export const AccessTypeEnum = z.enum([
  "OPEN",        // Cualquiera con el enlace puede unirse sin aprobación
  "TRUSTED",     // Solo usuarios autenticados de tu organización pueden unirse
  "RESTRICTED"   // Solo usuarios invitados específicamente pueden unirse
]);

export const EntryPointAccessEnum = z.enum([
  "ALL",             // Permitir todos los puntos de entrada
  "CREATOR_APP_ONLY" // Solo puntos de entrada del proyecto que creó el space
]);

export const ModerationEnum = z.enum(["ON", "OFF"]);

export const RestrictionTypeEnum = z.enum([
  "HOSTS_ONLY",     // Solo organizador y coorganizadores
  "NO_RESTRICTION"  // Todos los participantes
]);

export const DefaultJoinAsViewerTypeEnum = z.enum(["ON", "OFF"]);

export const AutoGenerationTypeEnum = z.enum(["ON", "OFF"]);

export const AttendanceReportGenerationTypeEnum = z.enum([
  "GENERATE_REPORT",
  "DO_NOT_GENERATE"
]);

export const MemberRoleEnum = z.enum([
  "ROLE_UNSPECIFIED", // Participante normal
  "COHOST"            // Coorganizador con permisos de administración
]);

// Esquemas de configuración detallados
export const ModerationRestrictionsSchema = z.object({
  chatRestriction: RestrictionTypeEnum.optional(),
  reactionRestriction: RestrictionTypeEnum.optional(),
  presentRestriction: RestrictionTypeEnum.optional(),
  defaultJoinAsViewerType: DefaultJoinAsViewerTypeEnum.optional()
});

export const RecordingConfigSchema = z.object({
  autoRecordingGeneration: AutoGenerationTypeEnum.default("OFF")
});

export const TranscriptionConfigSchema = z.object({
  autoTranscriptionGeneration: AutoGenerationTypeEnum.default("OFF")
});

export const SmartNotesConfigSchema = z.object({
  autoSmartNotesGeneration: AutoGenerationTypeEnum.default("OFF")
});

export const ArtifactConfigSchema = z.object({
  recordingConfig: RecordingConfigSchema.optional(),
  transcriptionConfig: TranscriptionConfigSchema.optional(),
  smartNotesConfig: SmartNotesConfigSchema.optional()
});

// Configuración completa del espacio
export const SpaceConfigSchema = z.object({
  // Acceso y puntos de entrada
  accessType: AccessTypeEnum.default("TRUSTED"),
  entryPointAccess: EntryPointAccessEnum.default("ALL"),
  
  // Moderación
  moderation: ModerationEnum.default("OFF"),
  moderationRestrictions: ModerationRestrictionsSchema.optional(),
  
  // Artefactos automáticos (requiere meetings.space.settings scope)
  artifactConfig: ArtifactConfigSchema.optional(),
  
  // Informes de asistencia
  attendanceReportGenerationType: AttendanceReportGenerationTypeEnum.default("DO_NOT_GENERATE")
});

// Esquema completo para crear un espacio
export const CreateSpaceSchema = z.object({
  // Metadata básico
  displayName: z.string().min(1, "Display name is required").max(100, "Display name too long").optional(),
  
  // Configuración del espacio
  config: SpaceConfigSchema.optional(),
  
  // Miembros iniciales (requiere v2beta)
  initialMembers: z.array(z.object({
    email: z.string().email("Invalid email format"),
    role: MemberRoleEnum.default("ROLE_UNSPECIFIED"),
    displayName: z.string().optional()
  })).default([])
});

// Esquema para actualizar configuración
export const UpdateSpaceConfigSchema = SpaceConfigSchema.partial();

// Esquemas para miembros
export const CreateMemberSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: MemberRoleEnum.default("ROLE_UNSPECIFIED"),
  displayName: z.string().optional()
});

export const BulkCreateMembersSchema = z.object({
  members: z.array(CreateMemberSchema).min(1, "At least one member is required").max(50, "Maximum 50 members at once")
});

// Esquemas de plantillas predefinidas
export const MeetingTemplateEnum = z.enum([
  "OPEN_MEETING",      // Reunión abierta y accesible
  "RESTRICTED_MEETING", // Reunión restringida y segura
  "TRAINING_SESSION",   // Sesión de entrenamiento
  "PRESENTATION",       // Presentación formal
  "INTERVIEW",         // Entrevista
  "WEBINAR",           // Seminario web
  "TEAM_STANDUP",      // Reunión de equipo
  "CUSTOM"             // Configuración personalizada
]);

export const ApplyTemplateSchema = z.object({
  template: MeetingTemplateEnum,
  customConfig: SpaceConfigSchema.optional()
});

// Funciones auxiliares para generar configuraciones de plantillas
export const generateTemplateConfig = (template: z.infer<typeof MeetingTemplateEnum>): z.infer<typeof SpaceConfigSchema> => {
  switch (template) {
    case "OPEN_MEETING":
      return {
        accessType: "OPEN",
        moderation: "OFF",
        moderationRestrictions: {
          chatRestriction: "NO_RESTRICTION",
          presentRestriction: "NO_RESTRICTION",
          defaultJoinAsViewerType: "OFF"
        },
        attendanceReportGenerationType: "DO_NOT_GENERATE"
      };
      
    case "RESTRICTED_MEETING":
      return {
        accessType: "RESTRICTED",
        moderation: "ON",
        moderationRestrictions: {
          chatRestriction: "HOSTS_ONLY",
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewerType: "ON"
        },
        attendanceReportGenerationType: "GENERATE_REPORT"
      };
      
    case "TRAINING_SESSION":
      return {
        accessType: "TRUSTED",
        moderation: "ON",
        moderationRestrictions: {
          presentRestriction: "HOSTS_ONLY",
          chatRestriction: "NO_RESTRICTION",
          defaultJoinAsViewerType: "ON"
        },
        artifactConfig: {
          recordingConfig: { autoRecordingGeneration: "ON" },
          transcriptionConfig: { autoTranscriptionGeneration: "ON" },
          smartNotesConfig: { autoSmartNotesGeneration: "ON" }
        },
        attendanceReportGenerationType: "GENERATE_REPORT"
      };
      
    case "PRESENTATION":
      return {
        accessType: "TRUSTED",
        moderation: "ON",
        moderationRestrictions: {
          chatRestriction: "HOSTS_ONLY",
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewerType: "ON"
        },
        artifactConfig: {
          recordingConfig: { autoRecordingGeneration: "ON" }
        }
      };
      
    case "INTERVIEW":
      return {
        accessType: "RESTRICTED",
        moderation: "ON",
        moderationRestrictions: {
          chatRestriction: "NO_RESTRICTION",
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewerType: "OFF"
        },
        attendanceReportGenerationType: "GENERATE_REPORT"
      };
      
    case "WEBINAR":
      return {
        accessType: "OPEN",
        moderation: "ON",
        moderationRestrictions: {
          chatRestriction: "HOSTS_ONLY",
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewerType: "ON"
        },
        artifactConfig: {
          recordingConfig: { autoRecordingGeneration: "ON" },
          smartNotesConfig: { autoSmartNotesGeneration: "ON" }
        }
      };
      
    case "TEAM_STANDUP":
      return {
        accessType: "TRUSTED",
        moderation: "OFF",
        moderationRestrictions: {
          chatRestriction: "NO_RESTRICTION",
          presentRestriction: "NO_RESTRICTION",
          defaultJoinAsViewerType: "OFF"
        }
      };
      
    default:
      return {
        accessType: "TRUSTED",
        moderation: "OFF",
        attendanceReportGenerationType: "DO_NOT_GENERATE"
      };
  }
};

// Tipos TypeScript derivados
export type AccessType = z.infer<typeof AccessTypeEnum>;
export type EntryPointAccess = z.infer<typeof EntryPointAccessEnum>;
export type MemberRole = z.infer<typeof MemberRoleEnum>;
export type MeetingTemplate = z.infer<typeof MeetingTemplateEnum>;
export type SpaceConfig = z.infer<typeof SpaceConfigSchema>;
export type CreateSpaceData = z.infer<typeof CreateSpaceSchema>;
export type CreateMemberData = z.infer<typeof CreateMemberSchema>;
export type BulkCreateMembersData = z.infer<typeof BulkCreateMembersSchema>;