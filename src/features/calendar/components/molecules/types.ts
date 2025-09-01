/**
 * Calendar Molecules - Types & Interfaces
 * 
 * Centralización de todas las interfaces y types para molecules
 */

import { ParticipantKPI } from "@/src/features/calendar/types/participant-kpis";

// Base molecule props
export interface BaseMoleculeProps {
  isLoading?: boolean;
  className?: string;
}

// Card props
export interface ParticipantCardProps extends BaseMoleculeProps {
  kpi: ParticipantKPI;
  onRemove?: (email: string) => void;
}

// Form props
export interface Attendee {
  email?: string;
  displayName?: string;
  responseStatus?: string;
}

export interface EditableAttendeesFieldProps extends BaseMoleculeProps {
  attendees?: Attendee[];
  eventId: string;
  calendarId: string;
  onUpdate: (eventId: string, calendarId: string, attendees: Attendee[]) => Promise<void>;
}

// Table props
export interface ColumnControllerProps extends BaseMoleculeProps {
  visibleColumns: string[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

// Column configuration
export interface ColumnConfig {
  id: string;
  label: string;
  description: string;
  category: string;
  defaultVisible: boolean;
}