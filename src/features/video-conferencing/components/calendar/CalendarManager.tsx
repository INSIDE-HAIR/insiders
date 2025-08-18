/**
 * CalendarManager Component
 * Manages multiple calendar events and integrations
 */
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react";
import { CalendarIntegration } from "./CalendarIntegration";
import { CalendarEventStatus } from "./CalendarEventStatus";
import { formatDate, formatTime } from "@/lib/utils";
import type { VideoSpace } from "../../types";

interface CalendarManagerProps {
  videoSpaces: VideoSpace[];
  className?: string;
  onEventUpdate?: (spaceId: string, isAdded: boolean) => void;
  onBulkExport?: (spaceIds: string[]) => void;
}

type FilterStatus =
  | "all"
  | "upcoming"
  | "in-progress"
  | "completed"
  | "added-to-calendar";
type SortField = "date" | "title" | "status" | "attendees";

interface CalendarEvent {
  id: string;
  videoSpace: VideoSpace;
  isAddedToCalendar: boolean;
  status: "upcoming" | "in-progress" | "completed";
  attendeeCount: number;
}

export function CalendarManager({
  videoSpaces,
  className,
  onEventUpdate,
  onBulkExport,
}: CalendarManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("list");

  // Convert video spaces to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return videoSpaces.map((space) => ({
      id: space.id,
      videoSpace: space,
      isAddedToCalendar: false, // This would come from user preferences/storage
      status: getEventStatus(space.scheduledStartTime),
      attendeeCount: space.participants?.length || 0,
    }));
  }, [videoSpaces]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = calendarEvents.filter((event) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        event.videoSpace.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        event.videoSpace.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Status filter
      let matchesStatus = true;
      switch (filterStatus) {
        case "upcoming":
          matchesStatus = event.status === "upcoming";
          break;
        case "in-progress":
          matchesStatus = event.status === "in-progress";
          break;
        case "completed":
          matchesStatus = event.status === "completed";
          break;
        case "added-to-calendar":
          matchesStatus = event.isAddedToCalendar;
          break;
      }

      return matchesSearch && matchesStatus;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortField) {
        case "date":
          const dateA = a.videoSpace.scheduledStartTime?.getTime() || 0;
          const dateB = b.videoSpace.scheduledStartTime?.getTime() || 0;
          return dateA - dateB;
        case "title":
          return a.videoSpace.title.localeCompare(b.videoSpace.title);
        case "status":
          return a.status.localeCompare(b.status);
        case "attendees":
          return b.attendeeCount - a.attendeeCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [calendarEvents, searchQuery, filterStatus, sortField]);

  const handleEventSelection = (eventId: string, selected: boolean) => {
    const newSelection = new Set(selectedEvents);
    if (selected) {
      newSelection.add(eventId);
    } else {
      newSelection.delete(eventId);
    }
    setSelectedEvents(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map((e) => e.id)));
    }
  };

  const handleBulkExport = () => {
    if (selectedEvents.size > 0) {
      onBulkExport?.(Array.from(selectedEvents));
    }
  };

  const handleTrackingUpdate = (spaceId: string, isAdded: boolean) => {
    onEventUpdate?.(spaceId, isAdded);
    // Update local state if needed
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "in-progress":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className='h-3 w-3' />;
      case "in-progress":
        return <CheckCircle className='h-3 w-3 text-green-600' />;
      case "completed":
        return <CheckCircle className='h-3 w-3' />;
      default:
        return <AlertCircle className='h-3 w-3' />;
    }
  };

  const stats = {
    total: calendarEvents.length,
    upcoming: calendarEvents.filter((e) => e.status === "upcoming").length,
    inProgress: calendarEvents.filter((e) => e.status === "in-progress").length,
    completed: calendarEvents.filter((e) => e.status === "completed").length,
    addedToCalendar: calendarEvents.filter((e) => e.isAddedToCalendar).length,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            <Calendar className='h-6 w-6' />
            Calendar Manager
          </h2>
          <p className='text-muted-foreground'>
            Manage calendar integrations for your video conferences
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {selectedEvents.size > 0 && (
            <Button
              variant='outline'
              onClick={handleBulkExport}
              className='flex items-center gap-2'
            >
              <Download className='h-4 w-4' />
              Export Selected ({selectedEvents.size})
            </Button>
          )}

          <Button variant='outline' size='sm'>
            <Settings className='h-4 w-4 mr-2' />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <div className='text-sm text-muted-foreground'>Total Events</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.upcoming}
            </div>
            <div className='text-sm text-muted-foreground'>Upcoming</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.inProgress}
            </div>
            <div className='text-sm text-muted-foreground'>In Progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-gray-600'>
              {stats.completed}
            </div>
            <div className='text-sm text-muted-foreground'>Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {stats.addedToCalendar}
            </div>
            <div className='text-sm text-muted-foreground'>In Calendar</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search events...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select
              value={filterStatus}
              onValueChange={(value: FilterStatus) => setFilterStatus(value)}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Events</SelectItem>
                <SelectItem value='upcoming'>Upcoming</SelectItem>
                <SelectItem value='in-progress'>In Progress</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='added-to-calendar'>In Calendar</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortField}
              onValueChange={(value: SortField) => setSortField(value)}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='date'>Date</SelectItem>
                <SelectItem value='title'>Title</SelectItem>
                <SelectItem value='status'>Status</SelectItem>
                <SelectItem value='attendees'>Attendees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='list'>Event List</TabsTrigger>
          <TabsTrigger value='integration'>Quick Integration</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <Calendar className='h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50' />
                <h3 className='text-lg font-semibold mb-2'>No events found</h3>
                <p className='text-muted-foreground'>
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "No video conferences scheduled yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Bulk Actions */}
              <div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={
                      selectedEvents.size === filteredEvents.length &&
                      filteredEvents.length > 0
                    }
                    onChange={handleSelectAll}
                    className='rounded'
                  />
                  <span className='text-sm font-medium'>
                    {selectedEvents.size > 0
                      ? `${selectedEvents.size} selected`
                      : "Select all"}
                  </span>
                </div>

                {selectedEvents.size > 0 && (
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleBulkExport}
                    >
                      <Download className='h-4 w-4 mr-2' />
                      Export
                    </Button>
                  </div>
                )}
              </div>

              {/* Event List */}
              <div className='space-y-4'>
                {filteredEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-4'>
                        <input
                          type='checkbox'
                          checked={selectedEvents.has(event.id)}
                          onChange={(e) =>
                            handleEventSelection(event.id, e.target.checked)
                          }
                          className='mt-1 rounded'
                        />

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h3 className='font-semibold truncate'>
                              {event.videoSpace.title}
                            </h3>
                            <Badge
                              variant={getStatusBadgeVariant(event.status)}
                              className='flex items-center gap-1'
                            >
                              {getStatusIcon(event.status)}
                              <span className='capitalize'>{event.status}</span>
                            </Badge>
                            {event.isAddedToCalendar && (
                              <Badge
                                variant='outline'
                                className='text-green-600'
                              >
                                <CheckCircle className='h-3 w-3 mr-1' />
                                In Calendar
                              </Badge>
                            )}
                          </div>

                          <div className='flex items-center gap-4 text-sm text-muted-foreground mb-2'>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-4 w-4' />
                              <span>
                                {event.videoSpace.scheduledStartTime
                                  ? `${formatDate(event.videoSpace.scheduledStartTime)} at ${formatTime(event.videoSpace.scheduledStartTime)}`
                                  : "No date set"}
                              </span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Users className='h-4 w-4' />
                              <span>{event.attendeeCount} attendees</span>
                            </div>
                          </div>

                          {event.videoSpace.description && (
                            <p className='text-sm text-muted-foreground truncate mb-2'>
                              {event.videoSpace.description}
                            </p>
                          )}
                        </div>

                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setActiveTab("integration")}
                          >
                            <Plus className='h-4 w-4 mr-2' />
                            Add to Calendar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value='integration' className='space-y-6'>
          {filteredEvents.length > 0 ? (
            <div className='grid gap-6'>
              {filteredEvents.slice(0, 3).map((event) => (
                <div key={event.id} className='grid md:grid-cols-2 gap-6'>
                  <CalendarIntegration
                    videoSpace={event.videoSpace}
                    onTrackingUpdate={(isAdded) =>
                      handleTrackingUpdate(event.id, isAdded)
                    }
                  />
                  <CalendarEventStatus videoSpace={event.videoSpace} />
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className='p-12 text-center'>
                <Calendar className='h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50' />
                <h3 className='text-lg font-semibold mb-2'>
                  No events to integrate
                </h3>
                <p className='text-muted-foreground'>
                  Create some video conferences to see calendar integration
                  options.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function
function getEventStatus(
  scheduledStartTime?: Date
): "upcoming" | "in-progress" | "completed" {
  if (!scheduledStartTime) return "upcoming";

  const now = new Date();
  const startTime = new Date(scheduledStartTime);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

  if (now < startTime) {
    return "upcoming";
  } else if (now >= startTime && now <= endTime) {
    return "in-progress";
  } else {
    return "completed";
  }
}
