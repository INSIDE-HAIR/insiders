/**
 * InstructorPerformance Component
 * Displays instructor performance metrics and comparisons
 */
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  MessageSquare,
  Star,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { formatDuration, formatDate } from "@/lib/utils";

export interface InstructorMetrics {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalSessions: number;
  totalParticipants: number;
  totalDuration: number;
  averageEngagement: number;
  averageAttendance: number;
  satisfactionScore?: number;
  responseRate: number;
  onTimeRate: number;
  completionRate: number;
  lastActive: Date;
  cohorts: string[];
  strengths: string[];
  improvementAreas: string[];
  trend: {
    engagement: number;
    attendance: number;
    satisfaction: number;
  };
}

interface InstructorPerformanceProps {
  instructors: InstructorMetrics[];
  selectedPeriod?: "7d" | "30d" | "90d" | "all";
  onPeriodChange?: (period: "7d" | "30d" | "90d" | "all") => void;
  className?: string;
}

export function InstructorPerformance({
  instructors,
  selectedPeriod = "30d",
  onPeriodChange,
  className,
}: InstructorPerformanceProps) {
  const [sortBy, setSortBy] = useState<
    "engagement" | "attendance" | "satisfaction" | "sessions"
  >("engagement");
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(
    null
  );

  const sortedInstructors = [...instructors].sort((a, b) => {
    switch (sortBy) {
      case "engagement":
        return b.averageEngagement - a.averageEngagement;
      case "attendance":
        return b.averageAttendance - a.averageAttendance;
      case "satisfaction":
        return (b.satisfactionScore || 0) - (a.satisfactionScore || 0);
      case "sessions":
        return b.totalSessions - a.totalSessions;
      default:
        return 0;
    }
  });

  const getPerformanceLevel = (score: number) => {
    if (score >= 85)
      return {
        level: "Excellent",
        color: "text-green-600",
        variant: "default" as const,
      };
    if (score >= 70)
      return {
        level: "Good",
        color: "text-blue-600",
        variant: "secondary" as const,
      };
    if (score >= 55)
      return {
        level: "Fair",
        color: "text-yellow-600",
        variant: "outline" as const,
      };
    return {
      level: "Needs Improvement",
      color: "text-red-600",
      variant: "destructive" as const,
    };
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className='h-3 w-3 text-green-600' />;
    if (trend < -5) return <TrendingDown className='h-3 w-3 text-red-600' />;
    return null;
  };

  const getTopPerformers = () => {
    return sortedInstructors.slice(0, 3);
  };

  const getAverageMetrics = () => {
    if (instructors.length === 0) return null;

    return {
      averageEngagement:
        instructors.reduce((sum, i) => sum + i.averageEngagement, 0) /
        instructors.length,
      averageAttendance:
        instructors.reduce((sum, i) => sum + i.averageAttendance, 0) /
        instructors.length,
      averageSatisfaction:
        instructors.reduce((sum, i) => sum + (i.satisfactionScore || 0), 0) /
        instructors.length,
      totalSessions: instructors.reduce((sum, i) => sum + i.totalSessions, 0),
      totalParticipants: instructors.reduce(
        (sum, i) => sum + i.totalParticipants,
        0
      ),
    };
  };

  const averageMetrics = getAverageMetrics();
  const topPerformers = getTopPerformers();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            <User className='h-6 w-6' />
            Instructor Performance
          </h2>
          <p className='text-muted-foreground'>
            Compare instructor metrics and identify top performers
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Select
            value={selectedPeriod}
            onValueChange={(value: typeof selectedPeriod) =>
              onPeriodChange?.(value)
            }
          >
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7d'>Last 7 days</SelectItem>
              <SelectItem value='30d'>Last 30 days</SelectItem>
              <SelectItem value='90d'>Last 90 days</SelectItem>
              <SelectItem value='all'>All time</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: typeof sortBy) => setSortBy(value)}
          >
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='engagement'>Engagement</SelectItem>
              <SelectItem value='attendance'>Attendance</SelectItem>
              <SelectItem value='satisfaction'>Satisfaction</SelectItem>
              <SelectItem value='sessions'>Sessions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      {averageMetrics && (
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold'>{instructors.length}</div>
              <div className='text-sm text-muted-foreground'>Instructors</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold'>
                {averageMetrics.totalSessions}
              </div>
              <div className='text-sm text-muted-foreground'>
                Total Sessions
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold'>
                {Math.round(averageMetrics.averageEngagement)}%
              </div>
              <div className='text-sm text-muted-foreground'>
                Avg Engagement
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold'>
                {Math.round(averageMetrics.averageAttendance)}%
              </div>
              <div className='text-sm text-muted-foreground'>
                Avg Attendance
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold'>
                {averageMetrics.averageSatisfaction > 0
                  ? Math.round(averageMetrics.averageSatisfaction)
                  : "N/A"}
              </div>
              <div className='text-sm text-muted-foreground'>
                Avg Satisfaction
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Award className='h-5 w-5' />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {topPerformers.map((instructor, index) => {
              const performance = getPerformanceLevel(
                instructor.averageEngagement
              );
              return (
                <div
                  key={instructor.id}
                  className='border rounded-lg p-4 relative'
                >
                  {index === 0 && (
                    <div className='absolute -top-2 -right-2'>
                      <Badge className='bg-yellow-500 text-white'>
                        <Award className='h-3 w-3 mr-1' />
                        #1
                      </Badge>
                    </div>
                  )}

                  <div className='flex items-center gap-3 mb-3'>
                    <Avatar className='h-12 w-12'>
                      <AvatarImage
                        src={instructor.avatar}
                        alt={instructor.name}
                      />
                      <AvatarFallback>
                        {instructor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold truncate'>
                        {instructor.name}
                      </h3>
                      <p className='text-sm text-muted-foreground truncate'>
                        {instructor.email}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span>Engagement</span>
                      <div className='flex items-center gap-1'>
                        <span className='font-medium'>
                          {Math.round(instructor.averageEngagement)}%
                        </span>
                        {getTrendIcon(instructor.trend.engagement)}
                      </div>
                    </div>
                    <Progress
                      value={instructor.averageEngagement}
                      className='h-2'
                    />

                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span>{instructor.totalSessions} sessions</span>
                      <Badge variant={performance.variant} className='text-xs'>
                        {performance.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Instructor List */}
      <Card>
        <CardHeader>
          <CardTitle>All Instructors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {sortedInstructors.map((instructor, index) => {
              const performance = getPerformanceLevel(
                instructor.averageEngagement
              );
              const isSelected = selectedInstructor === instructor.id;

              return (
                <div key={instructor.id} className='space-y-3'>
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-muted/50"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() =>
                      setSelectedInstructor(isSelected ? null : instructor.id)
                    }
                  >
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium'>
                        #{index + 1}
                      </div>

                      <Avatar className='h-10 w-10'>
                        <AvatarImage
                          src={instructor.avatar}
                          alt={instructor.name}
                        />
                        <AvatarFallback>
                          {instructor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-semibold truncate'>
                            {instructor.name}
                          </h3>
                          <Badge
                            variant={performance.variant}
                            className='text-xs'
                          >
                            {performance.level}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground truncate'>
                          {instructor.cohorts.length} cohorts • Last active{" "}
                          {formatDate(instructor.lastActive)}
                        </p>
                      </div>

                      <div className='grid grid-cols-4 gap-4 text-center text-sm'>
                        <div>
                          <div className='font-semibold flex items-center gap-1'>
                            {Math.round(instructor.averageEngagement)}%
                            {getTrendIcon(instructor.trend.engagement)}
                          </div>
                          <div className='text-muted-foreground'>
                            Engagement
                          </div>
                        </div>
                        <div>
                          <div className='font-semibold flex items-center gap-1'>
                            {Math.round(instructor.averageAttendance)}%
                            {getTrendIcon(instructor.trend.attendance)}
                          </div>
                          <div className='text-muted-foreground'>
                            Attendance
                          </div>
                        </div>
                        <div>
                          <div className='font-semibold'>
                            {instructor.satisfactionScore
                              ? Math.round(instructor.satisfactionScore)
                              : "N/A"}
                          </div>
                          <div className='text-muted-foreground'>
                            Satisfaction
                          </div>
                        </div>
                        <div>
                          <div className='font-semibold'>
                            {instructor.totalSessions}
                          </div>
                          <div className='text-muted-foreground'>Sessions</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div className='ml-12 p-4 border rounded-lg bg-muted/30'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <h4 className='font-medium mb-3 flex items-center gap-2'>
                            <BarChart3 className='h-4 w-4' />
                            Performance Metrics
                          </h4>
                          <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm'>On-time Rate</span>
                              <span className='font-medium'>
                                {Math.round(instructor.onTimeRate)}%
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm'>Response Rate</span>
                              <span className='font-medium'>
                                {Math.round(instructor.responseRate)}%
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm'>Completion Rate</span>
                              <span className='font-medium'>
                                {Math.round(instructor.completionRate)}%
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm'>
                                Total Participants
                              </span>
                              <span className='font-medium'>
                                {instructor.totalParticipants}
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm'>Total Duration</span>
                              <span className='font-medium'>
                                {formatDuration(instructor.totalDuration)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className='font-medium mb-3 flex items-center gap-2'>
                            <Target className='h-4 w-4' />
                            Strengths & Areas for Improvement
                          </h4>
                          <div className='space-y-3'>
                            <div>
                              <span className='text-sm font-medium text-green-600 flex items-center gap-1 mb-2'>
                                <CheckCircle className='h-3 w-3' />
                                Strengths
                              </span>
                              <div className='flex flex-wrap gap-1'>
                                {instructor.strengths.map((strength, i) => (
                                  <Badge
                                    key={i}
                                    variant='outline'
                                    className='text-xs text-green-600'
                                  >
                                    {strength}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {instructor.improvementAreas.length > 0 && (
                              <div>
                                <span className='text-sm font-medium text-orange-600 flex items-center gap-1 mb-2'>
                                  <AlertTriangle className='h-3 w-3' />
                                  Areas for Improvement
                                </span>
                                <div className='flex flex-wrap gap-1'>
                                  {instructor.improvementAreas.map(
                                    (area, i) => (
                                      <Badge
                                        key={i}
                                        variant='outline'
                                        className='text-xs text-orange-600'
                                      >
                                        {area}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
