/**
 * Types and interfaces for Meet Room date management and filtering
 */

import type { MeetSpace } from '@prisma/client';

/**
 * Room status based on dates
 */
export enum RoomStatus {
  ALWAYS_OPEN = 'always_open',  // No end date specified
  OPEN = 'open',                 // Currently between start and end dates
  CLOSED = 'closed',             // Past end date (archived)
  UPCOMING = 'upcoming'          // Before start date
}

/**
 * Predefined date filters for room listings
 */
export enum DateFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  PAST = 'past',
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  CUSTOM = 'custom'
}

/**
 * Room filter options for search and filtering
 */
export interface RoomFilters {
  search?: string;
  dateFilter?: DateFilter;
  customDateRange?: {
    start?: Date;
    end?: Date;
  };
  tags?: string[];
  groups?: string[];
  status?: RoomStatus[];
}

/**
 * Extended MeetSpace interface with dates and calculated status
 */
export interface MeetSpaceWithDates extends MeetSpace {
  startDate: Date | null;
  endDate: Date | null;
  status?: RoomStatus;
  _metadata?: {
    localId: string;
    displayName?: string;
    createdAt: Date;
    createdBy?: string;
    lastSyncAt?: Date;
    source: string;
    membersCount?: number;
    error?: string;
    status?: RoomStatus;
  };
  members?: any[];
}

/**
 * API response for filtered rooms
 */
export interface FilteredRoomsResponse {
  rooms: MeetSpaceWithDates[];
  total: number;
  filtered: number;
  filters: RoomFilters;
  stats?: {
    byStatus: Record<RoomStatus, number>;
    byDateFilter: Record<DateFilter, number>;
  };
}

/**
 * Date range for custom filtering
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Room date update payload
 */
export interface RoomDateUpdate {
  startDate?: Date | null;
  endDate?: Date | null;
}

/**
 * Room creation payload with dates
 */
export interface CreateRoomWithDates {
  displayName: string;
  config?: any;
  startDate?: Date | null;
  endDate?: Date | null;
  initialMembers?: any[];
}

/**
 * Status badge variant mapping
 */
export const StatusBadgeVariant: Record<RoomStatus, string> = {
  [RoomStatus.ALWAYS_OPEN]: 'success',
  [RoomStatus.OPEN]: 'success',
  [RoomStatus.CLOSED]: 'secondary',
  [RoomStatus.UPCOMING]: 'default'
};

/**
 * Status display labels (Spanish)
 */
export const StatusLabels: Record<RoomStatus, string> = {
  [RoomStatus.ALWAYS_OPEN]: 'Siempre abierta',
  [RoomStatus.OPEN]: 'Abierta',
  [RoomStatus.CLOSED]: 'Cerrada',
  [RoomStatus.UPCOMING]: 'Por abrir'
};

/**
 * Date filter labels (Spanish)
 */
export const DateFilterLabels: Record<DateFilter, string> = {
  [DateFilter.ALL]: 'Todos',
  [DateFilter.UPCOMING]: 'Próximos',
  [DateFilter.PAST]: 'Pasados',
  [DateFilter.TODAY]: 'Hoy',
  [DateFilter.THIS_WEEK]: 'Esta semana',
  [DateFilter.THIS_MONTH]: 'Este mes',
  [DateFilter.CUSTOM]: 'Personalizado'
};