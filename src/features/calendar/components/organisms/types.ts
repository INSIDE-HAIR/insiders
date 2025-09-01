/**
 * Calendar Organisms - Types & Interfaces
 * 
 * Centralización de todas las interfaces y types para organisms
 */

import { GoogleCalendarEvent, ParticipantKPI } from "@/src/features/calendar/types";
import { ColumnDef } from "@tanstack/react-table";

// Base organism props
export interface BaseOrganismProps {
  isLoading?: boolean;
  className?: string;
}

// Analytics props
export interface ParticipantKPISectionProps extends BaseOrganismProps {
  selectedAttendees: string[];
  events: GoogleCalendarEvent[];
  onRemoveAttendee: (email: string) => void;
  calendarIds?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// Table props
export interface EventsDataTableProps<TData> extends BaseOrganismProps {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick?: (item: TData) => void;
  onBulkAddParticipants?: (selectedEvents: TData[]) => void;
  onBulkGenerateMeetLinks?: (selectedEvents: TData[]) => void;
  onBulkGenerateDescriptions?: (selectedEvents: TData[]) => void;
  onBulkMoveCalendar?: (selectedEvents: TData[]) => void;
  onBulkUpdateDateTime?: (selectedEvents: TData[]) => void;
  calendars?: Array<{
    id: string;
    summary: string;
    colorId?: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
}

// Section props
export interface BulkActionsSectionProps extends BaseOrganismProps {
  selectedCount: number;
  eventsWithoutMeet?: number;
  onBulkAddParticipants?: () => void;
  onBulkGenerateMeetLinks?: () => void;
  onBulkGenerateDescriptions?: () => void;
  onBulkMoveCalendar?: () => void;
  onBulkUpdateDateTime?: () => void;
  onExportSelected?: () => void;
  onDeselectAll?: () => void;
}