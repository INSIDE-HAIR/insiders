/**
 * Tipos para KPIs de participantes en eventos del calendario
 */

import { AttendeeResponseStatus } from './calendar';

/**
 * KPI individual de un participante
 */
export interface ParticipantKPI {
  email: string;
  displayName?: string;
  totalEvents: number;
  acceptedEvents: number;
  declinedEvents: number;
  needsActionEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  totalDurationMinutes: number; // Total duration in minutes
  // Duration breakdowns by response status
  acceptedDurationMinutes: number; // Duration of accepted events
  declinedDurationMinutes: number; // Duration of declined events  
  needsActionDurationMinutes: number; // Duration of events needing action
  // Duration breakdowns by completion status
  completedDurationMinutes: number; // Duration of completed events
  upcomingDurationMinutes: number; // Duration of upcoming events
  participationRate: number; // % de eventos aceptados
  responseRate: number; // % de eventos con respuesta
}

/**
 * Respuesta del endpoint de KPIs de participantes
 */
export interface ParticipantKPIsResponse {
  success: boolean;
  kpis: Record<string, ParticipantKPI>;
  calculatedAt?: string;
}

/**
 * Parámetros para calcular KPIs de participantes
 */
export interface ParticipantKPIParams {
  emails: string[];
  startDate?: string;
  endDate?: string;
  calendarIds?: string[];
}