import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  VideoCameraIcon,
  UserPlusIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  UserMinusIcon,
  CogIcon,
  ClockIcon,
  CalendarIcon,
  ArrowRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  useRoomActivity,
  type ActivityData,
  type ConferenceRecord,
  type Recording,
  type Transcript,
} from "../../../hooks/useRoomActivity";
import { cn } from "@/src/lib/utils";

export interface ActivityItem {
  id: string;
  type:
    | "conference_started"
    | "conference_ended"
    | "member_joined"
    | "member_left"
    | "recording_started"
    | "recording_completed"
    | "transcript_generated"
    | "settings_changed"
    | "smart_notes_generated";
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  metadata?: {
    duration?: number;
    participantCount?: number;
    fileName?: string;
    settingChanged?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export interface ActivityFeedProps {
  roomId?: string;
  limit?: number;
  realTime?: boolean;
  showFilters?: boolean;
  className?: string;
}

/**
 * Feed de actividad en tiempo real para mostrar eventos de la sala
 * Incluye filtros, paginación y actualización automática
 */
export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  roomId,
  limit = 20,
  realTime = false,
  showFilters = true,
  className,
}) => {
  const {
    activityData,
    isLoading,
    error,
    formatDuration,
    formatDate,
    startRealTimeUpdates,
  } = useRoomActivity(roomId);

  const [filter, setFilter] = React.useState<
    "all" | "conferences" | "members" | "content" | "settings"
  >("all");
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  );

  // Start real-time updates if enabled
  React.useEffect(() => {
    if (realTime && roomId) {
      const cleanup = startRealTimeUpdates();
      return cleanup;
    }
  }, [realTime, roomId, startRealTimeUpdates]);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "conference_started":
      case "conference_ended":
        return VideoCameraIcon;
      case "member_joined":
        return UserPlusIcon;
      case "member_left":
        return UserMinusIcon;
      case "recording_started":
      case "recording_completed":
        return PlayCircleIcon;
      case "transcript_generated":
      case "smart_notes_generated":
        return DocumentTextIcon;
      case "settings_changed":
        return CogIcon;
      default:
        return CalendarIcon;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "conference_started":
        return "text-green-600 bg-green-50";
      case "conference_ended":
        return "text-blue-600 bg-blue-50";
      case "member_joined":
        return "text-green-600 bg-green-50";
      case "member_left":
        return "text-red-600 bg-red-50";
      case "recording_completed":
      case "transcript_generated":
      case "smart_notes_generated":
        return "text-purple-600 bg-purple-50";
      case "settings_changed":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getBadgeVariant = (type: ActivityItem["type"]) => {
    switch (type) {
      case "conference_started":
      case "member_joined":
        return "default";
      case "conference_ended":
      case "recording_completed":
        return "secondary";
      case "member_left":
        return "destructive";
      default:
        return "outline";
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Transform API data to activity items (simplified for demo)
  const activityItems: ActivityItem[] = React.useMemo(() => {
    const items: ActivityItem[] = [];
    const data = activityData as ActivityData | undefined;

    // Add conference records
    if (data?.conferenceRecords) {
      data.conferenceRecords.forEach(
        (conference: ConferenceRecord, index: number) => {
          items.push({
            id: `conf_start_${index}`,
            type: "conference_started",
            title: "Conferencia iniciada",
            description: `Reunión comenzó con ${conference.participantCount || 0} participantes`,
            timestamp: conference.startTime,
            metadata: {
              participantCount: conference.participantCount,
            },
          });

          if (conference.endTime) {
            items.push({
              id: `conf_end_${index}`,
              type: "conference_ended",
              title: "Conferencia finalizada",
              description: `Duración: ${formatDuration(conference.duration || 0)}`,
              timestamp: conference.endTime,
              metadata: {
                duration: conference.duration,
                participantCount: conference.participantCount,
              },
            });
          }
        }
      );
    }

    // Add recordings
    if (data?.recordings) {
      data.recordings.forEach((recording: Recording, index: number) => {
        items.push({
          id: `rec_${index}`,
          type: "recording_completed",
          title: "Grabación completada",
          description: "Nueva grabación disponible",
          timestamp: recording.endTime || recording.startTime,
          metadata: {
            fileName: `Grabación ${index + 1}`,
          },
        });
      });
    }

    // Add transcripts
    if (data?.transcripts) {
      data.transcripts.forEach((transcript: Transcript, index: number) => {
        items.push({
          id: `trans_${index}`,
          type: "transcript_generated",
          title: "Transcripción generada",
          description: "Transcripción automática disponible",
          timestamp: transcript.endTime || transcript.startTime,
          metadata: {
            fileName: `Transcripción ${index + 1}`,
          },
        });
      });
    }

    // Sort by timestamp (newest first)
    return items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activityData, formatDuration]);

  const filteredItems = activityItems
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "conferences") return item.type.includes("conference");
      if (filter === "members") return item.type.includes("member");
      if (filter === "content")
        return [
          "recording_completed",
          "transcript_generated",
          "smart_notes_generated",
        ].includes(item.type);
      if (filter === "settings") return item.type === "settings_changed";
      return true;
    })
    .slice(0, limit);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ClockIcon className='h-5 w-5' />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex items-start gap-3'>
                <div className='h-8 w-8 bg-muted rounded-full animate-pulse'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-muted rounded animate-pulse'></div>
                  <div className='h-3 bg-muted rounded w-3/4 animate-pulse'></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || filteredItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ClockIcon className='h-5 w-5' />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <ClockIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              {error ? "Error al cargar actividad" : "Sin actividad reciente"}
            </h3>
            <p className='text-muted-foreground'>
              {error
                ? "No se pudo cargar la actividad de la sala"
                : "La actividad aparecerá aquí cuando haya eventos en la sala"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <ClockIcon className='h-5 w-5' />
            Actividad Reciente
            {realTime && (
              <div className='flex items-center gap-1 text-sm font-normal'>
                <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse'></div>
                <span className='text-muted-foreground'>En vivo</span>
              </div>
            )}
          </CardTitle>

          {showFilters && (
            <div className='flex gap-1'>
              {[
                { key: "all", label: "Todos" },
                { key: "conferences", label: "Conferencias" },
                { key: "members", label: "Miembros" },
                { key: "content", label: "Contenido" },
                { key: "settings", label: "Configuración" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "ghost"}
                  size='sm'
                  onClick={() => setFilter(key as any)}
                  className='h-7 px-2 text-xs'
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <ScrollArea className='h-96'>
          <div className='space-y-4'>
            {filteredItems.map((item, index) => {
              const Icon = getActivityIcon(item.type);
              const colorClasses = getActivityColor(item.type);
              const isExpanded = expandedItems.has(item.id);
              const isLast = index === filteredItems.length - 1;

              return (
                <div key={item.id} className='relative'>
                  <div className='flex items-start gap-3'>
                    {/* Timeline line */}
                    {!isLast && (
                      <div className='absolute left-4 top-8 bottom-0 w-px bg-border'></div>
                    )}

                    {/* Activity icon */}
                    <div className={cn("p-2 rounded-full", colorClasses)}>
                      <Icon className='h-4 w-4' />
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0 pb-4'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <p className='text-sm font-medium'>{item.title}</p>
                            <Badge
                              variant={getBadgeVariant(item.type)}
                              className='text-xs'
                            >
                              {item.type.replace(/_/g, " ")}
                            </Badge>
                          </div>

                          {item.description && (
                            <p className='text-sm text-muted-foreground mb-2'>
                              {item.description}
                            </p>
                          )}

                          {/* User info */}
                          {item.user && (
                            <div className='flex items-center gap-2 mb-2'>
                              <Avatar className='h-6 w-6'>
                                <AvatarImage src={item.user.avatar} />
                                <AvatarFallback className='text-xs'>
                                  {item.user.name?.[0] ||
                                    item.user.email?.[0] ||
                                    "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className='text-xs text-muted-foreground'>
                                {item.user.name || item.user.email}
                              </span>
                            </div>
                          )}

                          {/* Metadata */}
                          {item.metadata &&
                            Object.keys(item.metadata).length > 0 && (
                              <div className='space-y-1'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => toggleExpanded(item.id)}
                                  className='h-6 px-2 text-xs text-muted-foreground hover:text-foreground'
                                >
                                  <EyeIcon className='h-3 w-3 mr-1' />
                                  {isExpanded ? "Ocultar" : "Ver"} detalles
                                  <ArrowRightIcon
                                    className={cn(
                                      "h-3 w-3 ml-1 transition-transform",
                                      isExpanded && "rotate-90"
                                    )}
                                  />
                                </Button>

                                {isExpanded && (
                                  <div className='bg-muted p-3 rounded-lg text-xs space-y-2'>
                                    {item.metadata.participantCount && (
                                      <div className='flex justify-between'>
                                        <span>Participantes:</span>
                                        <span>
                                          {item.metadata.participantCount}
                                        </span>
                                      </div>
                                    )}
                                    {item.metadata.duration && (
                                      <div className='flex justify-between'>
                                        <span>Duración:</span>
                                        <span>
                                          {formatDuration(
                                            item.metadata.duration
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {item.metadata.fileName && (
                                      <div className='flex justify-between'>
                                        <span>Archivo:</span>
                                        <span className='truncate ml-2'>
                                          {item.metadata.fileName}
                                        </span>
                                      </div>
                                    )}
                                    {item.metadata.settingChanged && (
                                      <div className='space-y-1'>
                                        <div className='flex justify-between'>
                                          <span>Configuración:</span>
                                          <span>
                                            {item.metadata.settingChanged}
                                          </span>
                                        </div>
                                        {item.metadata.oldValue &&
                                          item.metadata.newValue && (
                                            <div className='flex justify-between text-xs'>
                                              <span>
                                                {item.metadata.oldValue}
                                              </span>
                                              <ArrowRightIcon className='h-3 w-3 mx-1' />
                                              <span>
                                                {item.metadata.newValue}
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>

                        {/* Timestamp */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <time className='text-xs text-muted-foreground whitespace-nowrap'>
                                {formatDate(item.timestamp).split(" ")[1]}{" "}
                                {/* Show only time */}
                              </time>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatDate(item.timestamp)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {filteredItems.length === limit && (
          <div className='pt-4 border-t'>
            <Button variant='outline' className='w-full' size='sm'>
              Ver más actividad
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
