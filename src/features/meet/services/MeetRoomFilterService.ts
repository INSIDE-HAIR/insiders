/**
 * Service for filtering and searching Meet rooms
 */

import type { MeetSpace } from '@prisma/client';
import { 
  RoomStatus, 
  DateFilter, 
  RoomFilters, 
  MeetSpaceWithDates 
} from '../types/room-dates.types';
import {
  calculateRoomStatus,
  isRoomActiveToday,
  isRoomActiveThisWeek,
  isRoomActiveThisMonth,
  isPast,
  isUpcoming
} from '../utils/date-filters';

export class MeetRoomFilterService {
  /**
   * Apply date filter to rooms
   */
  filterByDateRange(
    spaces: MeetSpaceWithDates[], 
    filter: DateFilter
  ): MeetSpaceWithDates[] {
    return spaces.filter(space => {
      const status = calculateRoomStatus(space.startDate, space.endDate);
      
      switch (filter) {
        case DateFilter.ALL:
          return true;
          
        case DateFilter.UPCOMING:
          return status === RoomStatus.UPCOMING;
          
        case DateFilter.PAST:
          return status === RoomStatus.CLOSED;
          
        case DateFilter.TODAY:
          return isRoomActiveToday(space.startDate, space.endDate);
          
        case DateFilter.THIS_WEEK:
          return isRoomActiveThisWeek(space.startDate, space.endDate);
          
        case DateFilter.THIS_MONTH:
          return isRoomActiveThisMonth(space.startDate, space.endDate);
          
        default:
          return true;
      }
    });
  }
  
  /**
   * Search rooms by name, spaceId, and meeting code
   */
  searchByName(
    spaces: MeetSpaceWithDates[], 
    searchTerm: string
  ): MeetSpaceWithDates[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return spaces;
    }
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return spaces.filter(space => {
      // Check display name (metadata)
      const displayName = space.displayName?.toLowerCase() || '';
      const metadataDisplayName = (space as any)._metadata?.displayName?.toLowerCase() || '';
      
      // Check space ID
      const spaceId = space.spaceId?.toLowerCase() || '';
      const nameSpaceId = (space as any).name?.split('/')?.pop()?.toLowerCase() || '';
      
      // Check meeting code
      const meetingCode = (space as any).meetingCode?.toLowerCase() || '';
      
      // Search in all relevant fields
      return displayName.includes(normalizedSearch) || 
             metadataDisplayName.includes(normalizedSearch) ||
             spaceId.includes(normalizedSearch) || 
             nameSpaceId.includes(normalizedSearch) ||
             meetingCode.includes(normalizedSearch);
    });
  }
  
  /**
   * Filter by custom date range
   */
  filterByCustomDateRange(
    spaces: MeetSpaceWithDates[],
    start?: Date,
    end?: Date
  ): MeetSpaceWithDates[] {
    if (!start && !end) {
      return spaces;
    }
    
    return spaces.filter(space => {
      // Check if room is active within the custom range
      if (start && space.endDate && space.endDate < start) {
        return false; // Room ended before range start
      }
      
      if (end && space.startDate && space.startDate > end) {
        return false; // Room starts after range end
      }
      
      return true;
    });
  }
  
  /**
   * Filter by room status
   */
  filterByStatus(
    spaces: MeetSpaceWithDates[],
    statuses: RoomStatus[]
  ): MeetSpaceWithDates[] {
    if (!statuses || statuses.length === 0) {
      return spaces;
    }
    
    return spaces.filter(space => {
      const status = calculateRoomStatus(space.startDate, space.endDate);
      return statuses.includes(status);
    });
  }
  
  /**
   * Filter by tags
   */
  filterByTags(
    spaces: MeetSpaceWithDates[],
    tagIds: string[]
  ): MeetSpaceWithDates[] {
    if (!tagIds || tagIds.length === 0) {
      return spaces;
    }
    
    return spaces.filter(space => {
      // Check if space has any of the specified tags
      const spaceTags = (space as any).spaceTags || [];
      return spaceTags.some((st: any) => tagIds.includes(st.tagId));
    });
  }
  
  /**
   * Filter by groups
   */
  filterByGroups(
    spaces: MeetSpaceWithDates[],
    groupIds: string[]
  ): MeetSpaceWithDates[] {
    if (!groupIds || groupIds.length === 0) {
      return spaces;
    }
    
    return spaces.filter(space => {
      // Check if space belongs to any of the specified groups
      const spaceGroups = (space as any).spaceGroups || [];
      return spaceGroups.some((sg: any) => groupIds.includes(sg.groupId));
    });
  }
  
  /**
   * Calculate status for a single room
   */
  calculateStatus(space: MeetSpaceWithDates): RoomStatus {
    return calculateRoomStatus(space.startDate, space.endDate);
  }
  
  /**
   * Apply multiple filters to rooms
   */
  applyFilters(
    spaces: MeetSpaceWithDates[], 
    filters: RoomFilters
  ): MeetSpaceWithDates[] {
    let filtered = [...spaces];
    
    // Apply search filter
    if (filters.search) {
      filtered = this.searchByName(filtered, filters.search);
    }
    
    // Apply date filter
    if (filters.dateFilter && filters.dateFilter !== DateFilter.ALL) {
      filtered = this.filterByDateRange(filtered, filters.dateFilter);
    }
    
    // Apply custom date range
    if (filters.customDateRange) {
      filtered = this.filterByCustomDateRange(
        filtered,
        filters.customDateRange.start,
        filters.customDateRange.end
      );
    }
    
    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = this.filterByStatus(filtered, filters.status);
    }
    
    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = this.filterByTags(filtered, filters.tags);
    }
    
    // Apply group filter
    if (filters.groups && filters.groups.length > 0) {
      filtered = this.filterByGroups(filtered, filters.groups);
    }
    
    // Add calculated status to each room
    filtered = filtered.map(space => ({
      ...space,
      status: this.calculateStatus(space)
    }));
    
    return filtered;
  }
  
  /**
   * Get statistics for rooms
   */
  getStatistics(spaces: MeetSpaceWithDates[]) {
    const stats = {
      total: spaces.length,
      byStatus: {
        [RoomStatus.ALWAYS_OPEN]: 0,
        [RoomStatus.OPEN]: 0,
        [RoomStatus.CLOSED]: 0,
        [RoomStatus.UPCOMING]: 0
      },
      byDateFilter: {
        [DateFilter.ALL]: spaces.length,
        [DateFilter.UPCOMING]: 0,
        [DateFilter.PAST]: 0,
        [DateFilter.TODAY]: 0,
        [DateFilter.THIS_WEEK]: 0,
        [DateFilter.THIS_MONTH]: 0
      }
    };
    
    spaces.forEach(space => {
      const status = this.calculateStatus(space);
      stats.byStatus[status]++;
      
      // Count for date filters
      if (status === RoomStatus.UPCOMING) {
        stats.byDateFilter[DateFilter.UPCOMING]++;
      }
      if (status === RoomStatus.CLOSED) {
        stats.byDateFilter[DateFilter.PAST]++;
      }
      if (isRoomActiveToday(space.startDate, space.endDate)) {
        stats.byDateFilter[DateFilter.TODAY]++;
      }
      if (isRoomActiveThisWeek(space.startDate, space.endDate)) {
        stats.byDateFilter[DateFilter.THIS_WEEK]++;
      }
      if (isRoomActiveThisMonth(space.startDate, space.endDate)) {
        stats.byDateFilter[DateFilter.THIS_MONTH]++;
      }
    });
    
    return stats;
  }
  
  /**
   * Sort rooms by various criteria
   */
  sortRooms(
    spaces: MeetSpaceWithDates[],
    sortBy: 'name' | 'startDate' | 'endDate' | 'status' | 'createdAt' = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): MeetSpaceWithDates[] {
    const sorted = [...spaces].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.displayName || '').localeCompare(b.displayName || '');
          break;
          
        case 'startDate':
          const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
          const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
          comparison = aStart - bStart;
          break;
          
        case 'endDate':
          const aEnd = a.endDate ? new Date(a.endDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bEnd = b.endDate ? new Date(b.endDate).getTime() : Number.MAX_SAFE_INTEGER;
          comparison = aEnd - bEnd;
          break;
          
        case 'status':
          const statusOrder = {
            [RoomStatus.UPCOMING]: 0,
            [RoomStatus.OPEN]: 1,
            [RoomStatus.ALWAYS_OPEN]: 2,
            [RoomStatus.CLOSED]: 3
          };
          const aStatus = this.calculateStatus(a);
          const bStatus = this.calculateStatus(b);
          comparison = statusOrder[aStatus] - statusOrder[bStatus];
          break;
          
        case 'createdAt':
        default:
          const aCreated = new Date(a.createdAt).getTime();
          const bCreated = new Date(b.createdAt).getTime();
          comparison = aCreated - bCreated;
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }
}