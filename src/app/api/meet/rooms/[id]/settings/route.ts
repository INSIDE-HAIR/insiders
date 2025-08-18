import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleMeetService } from "@/src/features/calendar/services/GoogleMeetService";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { z } from "zod";

// Schema para configuraciones específicas de Meet
const meetSettingsSchema = z.object({
  // Configuraciones de acceso
  accessType: z.enum(["OPEN", "TRUSTED", "RESTRICTED"]).optional(),
  entryPointAccess: z.enum(["ALL", "CREATOR_APP_ONLY"]).optional(),
  
  // Configuraciones de moderación
  moderationSettings: z.object({
    moderationEnabled: z.boolean().optional(),
    chatRestriction: z.enum(["HOSTS_ONLY", "NO_RESTRICTION"]).optional(),
    presentRestriction: z.enum(["HOSTS_ONLY", "NO_RESTRICTION"]).optional(),
    defaultJoinAsViewer: z.boolean().optional(),
    waitingRoomEnabled: z.boolean().optional(),
    admissionPolicy: z.enum(["AUTOMATIC", "KNOCK", "RESTRICTED"]).optional()
  }).optional(),
  
  // Configuraciones de grabación y transcripción
  recordingSettings: z.object({
    autoRecordingEnabled: z.boolean().optional(),
    recordingDestination: z.enum(["DRIVE", "CLOUD", "LOCAL"]).optional(),
    recordingPermissions: z.enum(["HOST_ONLY", "ALL_PARTICIPANTS", "COHOSTS_ONLY"]).optional(),
    autoRecordingGeneration: z.enum(["ON", "OFF"]).optional()
  }).optional(),
  
  transcriptionSettings: z.object({
    autoTranscriptionEnabled: z.boolean().optional(),
    transcriptionLanguage: z.string().optional(),
    autoTranscriptionGeneration: z.enum(["ON", "OFF"]).optional()
  }).optional(),
  
  // Configuraciones de notas inteligentes
  smartNotesSettings: z.object({
    autoSmartNotesEnabled: z.boolean().optional(),
    smartNotesLanguage: z.string().optional(),
    autoSmartNotesGeneration: z.enum(["ON", "OFF"]).optional()
  }).optional(),
  
  // Configuraciones de notificaciones
  notificationSettings: z.object({
    emailNotifications: z.boolean().optional(),
    reminderNotifications: z.boolean().optional(),
    joinNotifications: z.boolean().optional(),
    recordingNotifications: z.boolean().optional()
  }).optional(),
  
  // Configuraciones de seguridad
  securitySettings: z.object({
    requireAuthentication: z.boolean().optional(),
    allowAnonymousUsers: z.boolean().optional(),
    allowPhoneDialIn: z.boolean().optional(),
    encryptionEnabled: z.boolean().optional(),
    attendeeReportsEnabled: z.boolean().optional(),
    attendanceReportGeneration: z.enum(["GENERATE_REPORT", "DO_NOT_GENERATE"]).optional()
  }).optional(),
  
  // Configuraciones de interfaz
  uiSettings: z.object({
    showMeetingCode: z.boolean().optional(),
    showParticipantCount: z.boolean().optional(),
    enableChat: z.boolean().optional(),
    enableScreenShare: z.boolean().optional(),
    enableBreakoutRooms: z.boolean().optional(),
    customBranding: z.boolean().optional()
  }).optional()
});

// Schema para configuraciones rápidas predefinidas
const quickSettingsSchema = z.object({
  template: z.enum([
    "OPEN_MEETING",      // Reunión abierta y accesible
    "RESTRICTED_MEETING", // Reunión restringida y segura
    "TRAINING_SESSION",   // Sesión de entrenamiento
    "PRESENTATION",       // Presentación formal
    "INTERVIEW",         // Entrevista
    "WEBINAR",           // Seminario web
    "TEAM_STANDUP",      // Reunión de equipo
    "CUSTOM"             // Configuración personalizada
  ]),
  customSettings: meetSettingsSchema.optional()
});

/**
 * GET /api/meet/rooms/[id]/settings
 * Obtiene todas las configuraciones de un space/sala de Meet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id: spaceId } = await params;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 500 });
    }

    // Obtener configuraciones del space
    const spaceResponse = await fetch(
      `https://meet.googleapis.com/v2/spaces/${spaceId}?fields=config`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!spaceResponse.ok) {
      const errorText = await spaceResponse.text();
      console.error(`Failed to get Meet space settings: ${spaceResponse.status}`, errorText);
      
      return NextResponse.json({
        error: `Failed to get Meet space settings: ${spaceResponse.status} ${spaceResponse.statusText}`,
        details: errorText
      }, { status: spaceResponse.status });
    }

    const spaceData = await spaceResponse.json();
    
    // Transformar configuraciones de Meet API a nuestro formato
    const settings = transformMeetConfigToSettings(spaceData.config || {});
    
    console.log(`✅ Retrieved settings for space ${spaceId}`);

    return NextResponse.json({
      spaceId: spaceId,
      settings: settings,
      lastUpdated: new Date().toISOString(),
      source: "meet-api-v2"
    });

  } catch (error: any) {
    console.error("Failed to get Meet space settings:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error getting Meet space settings",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meet/rooms/[id]/settings
 * Actualiza configuraciones específicas de un space/sala de Meet
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id: spaceId } = await params;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Parsear y validar body
    const body = await request.json();
    
    // Detectar si es quick settings o configuraciones detalladas
    const isQuickSettings = body.template && typeof body.template === 'string';
    
    let validationResult;
    if (isQuickSettings) {
      validationResult = quickSettingsSchema.safeParse(body);
    } else {
      validationResult = meetSettingsSchema.safeParse(body);
    }
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid settings data", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 500 });
    }

    let settingsToApply;
    
    if (isQuickSettings) {
      // Aplicar configuraciones predefinidas según template
      settingsToApply = applyQuickSettingsTemplate((validationResult.data as any).template, (validationResult.data as any).customSettings);
    } else {
      settingsToApply = validationResult.data;
    }

    // Transformar nuestras configuraciones al formato de Meet API
    const meetApiConfig = transformSettingsToMeetConfig(settingsToApply);
    
    // Determinar qué campos actualizar
    const updateMask = generateUpdateMask(meetApiConfig);
    
    console.log('📝 Update mask:', updateMask);
    console.log('📦 Config to send:', JSON.stringify(meetApiConfig, null, 2));
    
    // Actualizar configuraciones
    // If updateMask is empty, don't include it to let API use defaults
    const url = updateMask 
      ? `https://meet.googleapis.com/v2/spaces/${spaceId}?updateMask=${encodeURIComponent(updateMask)}`
      : `https://meet.googleapis.com/v2/spaces/${spaceId}`;
    
    const updateResponse = await fetch(
      url,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config: meetApiConfig })
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Failed to update Meet space settings: ${updateResponse.status}`, errorText);
      
      return NextResponse.json({
        error: `Failed to update Meet space settings: ${updateResponse.status} ${updateResponse.statusText}`,
        details: errorText
      }, { status: updateResponse.status });
    }

    const updatedSpace = await updateResponse.json();
    console.log(`✅ Settings updated for space ${spaceId}`);

    // Devolver configuraciones transformadas
    const updatedSettings = transformMeetConfigToSettings(updatedSpace.config || {});

    return NextResponse.json({
      spaceId: spaceId,
      settings: updatedSettings,
      appliedTemplate: isQuickSettings ? (validationResult.data as any).template : null,
      lastUpdated: new Date().toISOString(),
      updateMask: updateMask
    });

  } catch (error: any) {
    console.error("Failed to update Meet space settings:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error updating Meet space settings",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

// Funciones auxiliares

function transformMeetConfigToSettings(meetConfig: any): any {
  return {
    accessType: meetConfig.accessType || "TRUSTED",
    entryPointAccess: meetConfig.entryPointAccess || "ALL",
    
    moderationSettings: {
      moderationEnabled: meetConfig.moderation === "ON",
      chatRestriction: meetConfig.moderationRestrictions?.chatRestriction || "NO_RESTRICTION",
      presentRestriction: meetConfig.moderationRestrictions?.presentRestriction || "NO_RESTRICTION",
      defaultJoinAsViewer: meetConfig.moderationRestrictions?.defaultJoinAsViewerType === "ON"
    },
    
    recordingSettings: {
      autoRecordingEnabled: meetConfig.artifactConfig?.recordingConfig?.autoRecordingGeneration === "ON",
      autoRecordingGeneration: meetConfig.artifactConfig?.recordingConfig?.autoRecordingGeneration || "OFF"
    },
    
    transcriptionSettings: {
      autoTranscriptionEnabled: meetConfig.artifactConfig?.transcriptionConfig?.autoTranscriptionGeneration === "ON",
      autoTranscriptionGeneration: meetConfig.artifactConfig?.transcriptionConfig?.autoTranscriptionGeneration || "OFF"
    },
    
    smartNotesSettings: {
      autoSmartNotesEnabled: meetConfig.artifactConfig?.smartNotesConfig?.autoSmartNotesGeneration === "ON",
      autoSmartNotesGeneration: meetConfig.artifactConfig?.smartNotesConfig?.autoSmartNotesGeneration || "OFF"
    },
    
    securitySettings: {
      attendanceReportGeneration: meetConfig.attendanceReportGenerationType || "DO_NOT_GENERATE"
    }
  };
}

function transformSettingsToMeetConfig(settings: any): any {
  const config: any = {};
  
  if (settings.accessType) config.accessType = settings.accessType;
  if (settings.entryPointAccess) config.entryPointAccess = settings.entryPointAccess;
  
  if (settings.moderationSettings) {
    if (settings.moderationSettings.moderationEnabled !== undefined) {
      config.moderation = settings.moderationSettings.moderationEnabled ? "ON" : "OFF";
    }
    
    if (settings.moderationSettings.chatRestriction || settings.moderationSettings.presentRestriction || settings.moderationSettings.defaultJoinAsViewer !== undefined) {
      config.moderationRestrictions = {};
      if (settings.moderationSettings.chatRestriction) {
        config.moderationRestrictions.chatRestriction = settings.moderationSettings.chatRestriction;
      }
      if (settings.moderationSettings.presentRestriction) {
        config.moderationRestrictions.presentRestriction = settings.moderationSettings.presentRestriction;
      }
      if (settings.moderationSettings.defaultJoinAsViewer !== undefined) {
        config.moderationRestrictions.defaultJoinAsViewerType = settings.moderationSettings.defaultJoinAsViewer ? "ON" : "OFF";
      }
    }
  }
  
  if (settings.recordingSettings || settings.transcriptionSettings || settings.smartNotesSettings) {
    config.artifactConfig = {};
    
    if (settings.recordingSettings?.autoRecordingGeneration) {
      config.artifactConfig.recordingConfig = {
        autoRecordingGeneration: settings.recordingSettings.autoRecordingGeneration
      };
    }
    
    if (settings.transcriptionSettings?.autoTranscriptionGeneration) {
      config.artifactConfig.transcriptionConfig = {
        autoTranscriptionGeneration: settings.transcriptionSettings.autoTranscriptionGeneration
      };
    }
    
    if (settings.smartNotesSettings?.autoSmartNotesGeneration) {
      config.artifactConfig.smartNotesConfig = {
        autoSmartNotesGeneration: settings.smartNotesSettings.autoSmartNotesGeneration
      };
    }
  }
  
  if (settings.securitySettings?.attendanceReportGeneration) {
    config.attendanceReportGenerationType = settings.securitySettings.attendanceReportGeneration;
  }
  
  return config;
}

function generateUpdateMask(config: any): string {
  // For Google Meet API v2, when updating artifactConfig subfields,
  // we need to use the full nested path for each specific field being updated
  const fields: string[] = [];
  
  if (config.accessType !== undefined) {
    fields.push('config.accessType');
  }
  if (config.entryPointAccess !== undefined) {
    fields.push('config.entryPointAccess');
  }
  if (config.moderation !== undefined) {
    fields.push('config.moderation');
  }
  
  if (config.moderationRestrictions !== undefined) {
    fields.push('config.moderationRestrictions');
  }
  
  // For artifactConfig, specify the exact nested field being updated
  if (config.artifactConfig !== undefined) {
    if (config.artifactConfig.recordingConfig !== undefined) {
      // Use the full nested path for recording config
      fields.push('config.artifactConfig.recordingConfig.autoRecordingGeneration');
    }
    if (config.artifactConfig.transcriptionConfig !== undefined) {
      // Use the full nested path for transcription config
      fields.push('config.artifactConfig.transcriptionConfig.autoTranscriptionGeneration');
    }
    if (config.artifactConfig.smartNotesConfig !== undefined) {
      // Use the full nested path for smart notes config
      fields.push('config.artifactConfig.smartNotesConfig.autoSmartNotesGeneration');
    }
  }
  
  if (config.attendanceReportGenerationType !== undefined) {
    fields.push('config.attendanceReportGenerationType');
  }
  
  // Log for debugging
  console.log('🎯 Generated update mask fields:', fields);
  
  return fields.join(',');
}

function applyQuickSettingsTemplate(template: string, customSettings?: any): any {
  const baseSettings = customSettings || {};
  
  switch (template) {
    case "OPEN_MEETING":
      return {
        ...baseSettings,
        accessType: "OPEN",
        moderationSettings: {
          moderationEnabled: false,
          chatRestriction: "NO_RESTRICTION",
          presentRestriction: "NO_RESTRICTION",
          defaultJoinAsViewer: false
        },
        securitySettings: {
          requireAuthentication: false,
          allowAnonymousUsers: true
        }
      };
      
    case "RESTRICTED_MEETING":
      return {
        ...baseSettings,
        accessType: "RESTRICTED",
        moderationSettings: {
          moderationEnabled: true,
          chatRestriction: "HOSTS_ONLY",
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewer: true
        },
        securitySettings: {
          requireAuthentication: true,
          allowAnonymousUsers: false
        }
      };
      
    case "TRAINING_SESSION":
      return {
        ...baseSettings,
        accessType: "TRUSTED",
        moderationSettings: {
          moderationEnabled: true,
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewer: true
        },
        recordingSettings: {
          autoRecordingGeneration: "ON"
        },
        transcriptionSettings: {
          autoTranscriptionGeneration: "ON"
        }
      };
      
    case "PRESENTATION":
      return {
        ...baseSettings,
        accessType: "TRUSTED",
        moderationSettings: {
          moderationEnabled: true,
          chatRestriction: "HOSTS_ONLY",
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewer: true
        },
        recordingSettings: {
          autoRecordingGeneration: "ON"
        }
      };
      
    case "INTERVIEW":
      return {
        ...baseSettings,
        accessType: "RESTRICTED",
        moderationSettings: {
          moderationEnabled: true,
          chatRestriction: "NO_RESTRICTION",
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewer: false
        },
        securitySettings: {
          requireAuthentication: true,
          attendanceReportGeneration: "GENERATE_REPORT"
        }
      };
      
    case "WEBINAR":
      return {
        ...baseSettings,
        accessType: "OPEN",
        moderationSettings: {
          moderationEnabled: true,
          chatRestriction: "HOSTS_ONLY",
          presentRestriction: "HOSTS_ONLY",
          defaultJoinAsViewer: true
        },
        recordingSettings: {
          autoRecordingGeneration: "ON"
        },
        smartNotesSettings: {
          autoSmartNotesGeneration: "ON"
        }
      };
      
    case "TEAM_STANDUP":
      return {
        ...baseSettings,
        accessType: "TRUSTED",
        moderationSettings: {
          moderationEnabled: false,
          chatRestriction: "NO_RESTRICTION",
          presentRestriction: "NO_RESTRICTION",
          defaultJoinAsViewer: false
        }
      };
      
    default:
      return baseSettings;
  }
}