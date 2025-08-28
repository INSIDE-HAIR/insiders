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