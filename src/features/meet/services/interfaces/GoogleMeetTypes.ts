/**
 * Tipos TypeScript específicos para Google Meet API v2/v2beta
 * Basado en datos reales de la API de Google Meet
 */

// ========================================
// TIPOS BÁSICOS DE GOOGLE MEET API
// ========================================

export interface GoogleMeetUser {
  /** Recurso del usuario (e.g., "users/123456789") */
  name?: string;
}

export interface GoogleMeetSignedInUser {
  /** Recurso del usuario autenticado */
  user: string;
  /** Nombre para mostrar del usuario */
  displayName: string;
}

export interface GoogleMeetAnonymousUser {
  /** Nombre para mostrar del usuario anónimo */
  displayName: string;
}

export interface GoogleMeetPhoneUser {
  /** Nombre para mostrar del usuario por teléfono */
  displayName: string;
}

// ========================================
// PARTICIPANTES
// ========================================

export interface GoogleMeetParticipant {
  /** Nombre del recurso del participante (e.g., "conferenceRecords/.../participants/...") */
  name: string;
  /** Hora más temprana de entrada del participante */
  earliestStartTime?: string;
  /** Hora más tardía de salida del participante */
  latestEndTime?: string;
  /** Usuario autenticado (si aplica) */
  signedinUser?: GoogleMeetSignedInUser;
  /** Usuario anónimo (si aplica) */
  anonymousUser?: GoogleMeetAnonymousUser;
  /** Usuario por teléfono (si aplica) */
  phoneUser?: GoogleMeetPhoneUser;
}

export interface GoogleMeetParticipantSession {
  /** Nombre del recurso de la sesión (e.g., "conferenceRecords/.../participants/.../participantSessions/...") */
  name: string;
  /** Hora de inicio de la sesión */
  startTime: string;
  /** Hora de fin de la sesión (si terminó) */
  endTime?: string;
  /** Referencia al participante */
  participant: string;
}

// ========================================
// RESPUESTAS DE LA API
// ========================================

export interface GoogleMeetParticipantsResponse {
  /** Lista de participantes */
  participants: GoogleMeetParticipant[];
  /** Token para la siguiente página */
  nextPageToken?: string;
}

export interface GoogleMeetParticipantSessionsResponse {
  /** Lista de sesiones del participante */
  participantSessions: GoogleMeetParticipantSession[];
  /** Token para la siguiente página */
  nextPageToken?: string;
}

export interface GoogleMeetConferenceRecord {
  /** Nombre del recurso de la conferencia */
  name: string;
  /** Hora de inicio de la conferencia */
  startTime: string;
  /** Hora de fin de la conferencia */
  endTime?: string;
  /** Fecha de expiración del recurso */
  expireTime?: string;
  /** Referencia al espacio donde ocurrió */
  space: {
    /** Nombre del espacio */
    name: string;
    /** Código del meeting */
    meetingCode?: string;
    /** URI del meeting */
    meetingUri?: string;
    /** Configuración del meeting */
    config?: {
      /** Tipo de acceso */
      accessType: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
      /** Configuración de ingreso */
      entryPointAccess: 'ALL' | 'CREATOR_APP_ONLY';
    };
  };
}

export interface GoogleMeetConferenceRecordsResponse {
  /** Lista de registros de conferencia */
  conferenceRecords: GoogleMeetConferenceRecord[];
  /** Token para la siguiente página */
  nextPageToken?: string;
}

// ========================================
// MIEMBROS DEL ESPACIO
// ========================================

export interface GoogleMeetSpaceMember {
  /** Nombre del recurso del miembro */
  name: string;
  /** Email del miembro */
  email?: string;
  /** Rol del miembro */
  role?: 'ROLE_UNSPECIFIED' | 'COHOST' | 'HOST';
  /** Información del usuario */
  user?: {
    /** Nombre del recurso del usuario */
    name: string;
    /** Nombre para mostrar */
    displayName?: string;
  };
  /** Fecha de creación */
  createTime?: string;
  /** Fecha de última actualización */
  updateTime?: string;
}

export interface GoogleMeetSpaceMembersResponse {
  /** Lista de miembros del espacio */
  members: GoogleMeetSpaceMember[];
  /** Token para la siguiente página */
  nextPageToken?: string;
}

// ========================================
// TIPOS PARA NUESTROS DATOS PROCESADOS
// ========================================

export type ParticipantType = 'signed_in' | 'anonymous' | 'phone';

export interface ProcessedParticipantInfo {
  type: ParticipantType;
  displayName: string;
  identifier: string;
  isInvited: boolean;
}

export interface ProcessedParticipantSession {
  sessionId: string;
  duration: number; // en minutos (total del participante en la conferencia)
  startTime: string; // hora de inicio de la conferencia
  conferenceDuration?: number; // duración total de la conferencia en minutos
  segments?: Array<{
    segmentStart: string;
    segmentEnd: string;
    segmentDuration: number; // en minutos
  }>; // Segmentos individuales si el participante entró/salió varias veces
}

export interface ProcessedParticipantData {
  sessionsAttended: string[];
  totalMinutesReal: number;
  participationSessions: ProcessedParticipantSession[];
}

export interface ProcessedAttendee extends ProcessedParticipantInfo, ProcessedParticipantData {}

// ========================================
// TIPOS PARA SESSION DETAILS (HH:MM:SS)
// ========================================

export interface SessionDetail {
  sessionId: string;
  startTime: string;
  formattedStartTime: string;
  durationMinutes: number;
  durationFormatted: string; // HH:MM:SS
  participationPercentage: number;
  sessionDate: string;
  dayOfWeek: string;
  timeOfDay: string;
}

export interface ParticipationStats {
  totalSessionsInSpace: number;
  longestSession: number;
  shortestSession: number;
  averageSessionDuration: number;
  firstParticipation?: string;
  lastParticipation?: string;
  uniqueDays: number;
  timePatterns: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  // Formatos HH:MM:SS
  longestSessionFormatted: string;
  shortestSessionFormatted: string;
  averageSessionDurationFormatted: string;
  totalMinutesFormatted: string;
}

// ========================================
// RESPONSE FINAL DE ANALYTICS
// ========================================

export interface ParticipantRanking {
  rank: number;
  participant: {
    name: string;
    email: string;
    type: ParticipantType;
    isInvited: boolean;
  };
  totalMinutes: number;
  totalMinutesFormatted: string; // HH:MM:SS
  sessionsCount: number;
  averageMinutesPerSession: number;
  averageMinutesPerSessionFormatted: string; // HH:MM:SS
  lastActivity: string;
  sessionDetails: SessionDetail[];
  participationStats: ParticipationStats;
}

export interface PermanentMembers {
  total: number;
  cohosts: number;
  regularMembers: number;
}

export interface Participants {
  invited: number;
  uninvited: number;
  unique: number;
}

export interface Sessions {
  total: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  averageParticipantsPerSession: number;
}

export interface RecentActivity {
  lastMeetingDate: string | null;
  lastParticipantCount: number;
  daysSinceLastMeeting: number | null;
}

export interface AnalyticsResponse {
  spaceId: string;
  permanentMembers: PermanentMembers;
  participants: Participants;
  sessions: Sessions;
  recentActivity: RecentActivity;
  participantRanking: ParticipantRanking[];
  calculatedAt: string;
}

// ========================================
// UTILIDADES PARA VALIDACIÓN
// ========================================

export const PARTICIPANT_TYPES = ['signed_in', 'anonymous', 'phone'] as const;
export const MEMBER_ROLES = ['ROLE_UNSPECIFIED', 'COHOST', 'HOST'] as const;
export const ACCESS_TYPES = ['OPEN', 'TRUSTED', 'RESTRICTED'] as const;