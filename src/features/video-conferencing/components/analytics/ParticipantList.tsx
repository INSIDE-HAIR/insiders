/**
 * ParticipantList Component
 * Displays participant list with search and filtering capabilities
 */
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Clock,
  MessageSquare,
  Mic,
  Video,
  User,
  Crown,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatDuration, formatTime } from "@/lib/utils";
import type { ParticipantData } from "../../types/analytics";

interface ParticipantListProps {
  participants: ParticipantData[];
  className?: string;
  showFilters?: boolean;
  maxHeight?: string;
}

type SortField = "name" | "joinTime" | "duration" | "engagement" | "messages";
type SortOrder = "asc" | "desc";
type FilterRole = "all" | "host" | "co-host" | "participant";
type FilterStatus = "all" | "active" | "inactive" | "left-early";

export function ParticipantList({
  participants,
  className,
  showFilters = true,
  maxHeight = "600px",
}: ParticipantListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("joinTime");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showInactive, setShowInactive] = useState(true);

  const filteredAndSortedParticipants = useMemo(() => {
    let filtered = participants.filter((participant) => {
      // Search filter
      const matchesSearch =
        participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole =
        filterRole === "all" || participant.role === filterRole;

      // Status filter
      let matchesStatus = true;
      if (filterStatus === "active") {
        matchesStatus = participant.isActive;
      } else if (filterStatus === "inactive") {
        matchesStatus = !participant.isActive;
      } else if (filterStatus === "left-early") {
        matchesStatus = participant.leftEarly;
      }

      // Show inactive filter
      const matchesInactive = showInactive || participant.isActive;

      return matchesSearch && matchesRole && matchesStatus && matchesInactive;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "joinTime":
          aValue = new Date(a.joinTime).getTime();
          bValue = new Date(b.joinTime).getTime();
          break;
        case "duration":
          aValue = a.totalDuration;
          bValue = b.totalDuration;
          break;
        case "engagement":
          aValue = a.engagementScore;
          bValue = b.engagementScore;
          break;
        case "messages":
          aValue = a.chatMessages;
          bValue = b.chatMessages;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    participants,
    searchQuery,
    sortField,
    sortOrder,
    filterRole,
    filterStatus,
    showInactive,
  ]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "host":
        return <Crown className='h-3 w-3' />;
      case "co-host":
        return <Shield className='h-3 w-3' />;
      default:
        return <User className='h-3 w-3' />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "host":
        return "default";
      case "co-host":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Participants ({filteredAndSortedParticipants.length})
          </CardTitle>

          {showFilters && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowInactive(!showInactive)}
              className='flex items-center gap-2'
            >
              {showInactive ? (
                <Eye className='h-4 w-4' />
              ) : (
                <EyeOff className='h-4 w-4' />
              )}
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </Button>
          )}
        </div>

        {showFilters && (
          <div className='flex flex-col sm:flex-row gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search participants...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select
              value={sortField}
              onValueChange={(value: SortField) => setSortField(value)}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name'>Name</SelectItem>
                <SelectItem value='joinTime'>Join Time</SelectItem>
                <SelectItem value='duration'>Duration</SelectItem>
                <SelectItem value='engagement'>Engagement</SelectItem>
                <SelectItem value='messages'>Messages</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>

            <Select
              value={filterRole}
              onValueChange={(value: FilterRole) => setFilterRole(value)}
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='host'>Host</SelectItem>
                <SelectItem value='co-host'>Co-host</SelectItem>
                <SelectItem value='participant'>Participant</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(value: FilterStatus) => setFilterStatus(value)}
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='left-early'>Left Early</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent className='p-0'>
        <div className='max-h-[600px] overflow-y-auto' style={{ maxHeight }}>
          {filteredAndSortedParticipants.length === 0 ? (
            <div className='p-6 text-center text-muted-foreground'>
              <User className='h-12 w-12 mx-auto mb-2 opacity-50' />
              <p>No participants found</p>
            </div>
          ) : (
            <div className='divide-y'>
              {filteredAndSortedParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className='p-4 hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-start gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage
                        src={participant.avatar}
                        alt={participant.name}
                      />
                      <AvatarFallback>
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-medium truncate'>
                          {participant.name}
                        </h4>
                        <Badge
                          variant={getRoleBadgeVariant(participant.role)}
                          className='text-xs'
                        >
                          {getRoleIcon(participant.role)}
                          <span className='ml-1 capitalize'>
                            {participant.role}
                          </span>
                        </Badge>
                        {!participant.isActive && (
                          <Badge
                            variant='outline'
                            className='text-xs text-muted-foreground'
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>

                      {participant.email && (
                        <p className='text-sm text-muted-foreground truncate mb-2'>
                          {participant.email}
                        </p>
                      )}

                      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3 text-muted-foreground' />
                          <span>{formatTime(participant.joinTime)}</span>
                        </div>

                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3 text-muted-foreground' />
                          <span>
                            {formatDuration(participant.totalDuration)}
                          </span>
                        </div>

                        <div className='flex items-center gap-1'>
                          <MessageSquare className='h-3 w-3 text-muted-foreground' />
                          <span>{participant.chatMessages} messages</span>
                        </div>

                        <div className='flex items-center gap-1'>
                          <span
                            className={`font-medium ${getEngagementColor(participant.engagementScore)}`}
                          >
                            {participant.engagementScore}% engaged
                          </span>
                        </div>
                      </div>

                      {/* Technical Info */}
                      <div className='flex items-center gap-2 mt-2'>
                        {participant.hadAudioIssues && (
                          <Badge
                            variant='outline'
                            className='text-xs text-red-600'
                          >
                            <Mic className='h-3 w-3 mr-1' />
                            Audio Issues
                          </Badge>
                        )}

                        {participant.hadVideoIssues && (
                          <Badge
                            variant='outline'
                            className='text-xs text-red-600'
                          >
                            <Video className='h-3 w-3 mr-1' />
                            Video Issues
                          </Badge>
                        )}

                        {participant.leftEarly && (
                          <Badge
                            variant='outline'
                            className='text-xs text-orange-600'
                          >
                            Left Early
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
