/**
 * CohortAnalytics Component
 * Displays cohort-based analytics with trend analysis
 */
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatDuration, formatDate, formatPercentage } from "@/lib/utils";
import type {
  CohortAnalytics as CohortAnalyticsType,
  EngagementTrendPoint,
} from "../../types/analytics";

interface CohortAnalyticsProps {
  cohort: CohortAnalyticsType;
  comparisonCohorts?: CohortAnalyticsType[];
  className?: string;
  onExport?: () => void;
}

export function CohortAnalytics({
  cohort,
  comparisonCohorts = [],
  className,
  onExport,
}: CohortAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    "engagement" | "attendance" | "completion"
  >("engagement");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );

  const getMetricTrend = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? "up" : ("down" as const),
      isPositive: change >= 0,
    };
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 80)
      return {
        level: "Excellent",
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      };
    if (score >= 60)
      return {
        level: "Good",
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      };
    if (score >= 40)
      return {
        level: "Fair",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      };
    return {
      level: "Needs Improvement",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    };
  };

  const engagementPerformance = getPerformanceLevel(
    cohort.performanceMetrics.averageEngagement
  );
  const retentionPerformance = getPerformanceLevel(
    cohort.performanceMetrics.retentionRate
  );

  // Filter trend data based on time range
  const filteredTrend = cohort.engagementTrend.filter((point) => {
    const now = new Date();
    const pointDate = new Date(point.date);
    const daysDiff = Math.floor(
      (now.getTime() - pointDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (timeRange) {
      case "7d":
        return daysDiff <= 7;
      case "30d":
        return daysDiff <= 30;
      case "90d":
        return daysDiff <= 90;
      default:
        return true;
    }
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            <Users className='h-6 w-6' />
            {cohort.name}
          </h2>
          <p className='text-muted-foreground'>
            {cohort.description || "Cohort analytics and performance metrics"}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Select
            value={timeRange}
            onValueChange={(value: typeof timeRange) => setTimeRange(value)}
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

          {onExport && (
            <Button variant='outline' onClick={onExport}>
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Participants</span>
            </div>
            <div className='text-2xl font-bold'>{cohort.participantCount}</div>
            <div className='text-xs text-muted-foreground'>Active learners</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Sessions</span>
            </div>
            <div className='text-2xl font-bold'>{cohort.meetingCount}</div>
            <div className='text-xs text-muted-foreground'>Total meetings</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Duration</span>
            </div>
            <div className='text-2xl font-bold'>
              {Math.round(cohort.totalDuration / (1000 * 60 * 60))}h
            </div>
            <div className='text-xs text-muted-foreground'>Total time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Target className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Completion</span>
            </div>
            <div className='text-2xl font-bold'>
              {Math.round(cohort.performanceMetrics.progressionRate)}%
            </div>
            <div className='text-xs text-muted-foreground'>Progress rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Engagement Performance
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className={`p-4 rounded-lg ${engagementPerformance.bgColor}`}>
              <div className='flex items-center justify-between mb-2'>
                <span className='font-medium'>Overall Engagement</span>
                <Badge
                  variant='outline'
                  className={engagementPerformance.color}
                >
                  {engagementPerformance.level}
                </Badge>
              </div>
              <div className='text-2xl font-bold mb-2'>
                {Math.round(cohort.performanceMetrics.averageEngagement)}%
              </div>
              <Progress
                value={cohort.performanceMetrics.averageEngagement}
                className='h-2'
              />
            </div>

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div className='text-center'>
                <div className='text-lg font-semibold text-green-600'>
                  {Math.round(cohort.attendanceRate)}%
                </div>
                <div className='text-muted-foreground'>Attendance Rate</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-semibold text-blue-600'>
                  {Math.round(cohort.averageParticipants)}
                </div>
                <div className='text-muted-foreground'>Avg Participants</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5' />
              Retention & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className={`p-4 rounded-lg ${retentionPerformance.bgColor}`}>
              <div className='flex items-center justify-between mb-2'>
                <span className='font-medium'>Retention Rate</span>
                <Badge variant='outline' className={retentionPerformance.color}>
                  {retentionPerformance.level}
                </Badge>
              </div>
              <div className='text-2xl font-bold mb-2'>
                {Math.round(cohort.performanceMetrics.retentionRate)}%
              </div>
              <Progress
                value={cohort.performanceMetrics.retentionRate}
                className='h-2'
              />
            </div>

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div className='text-center'>
                <div className='text-lg font-semibold text-purple-600'>
                  {Math.round(cohort.completionRate)}%
                </div>
                <div className='text-muted-foreground'>Completion Rate</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-semibold text-orange-600'>
                  {Math.round(cohort.performanceMetrics.progressionRate)}%
                </div>
                <div className='text-muted-foreground'>Progression Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs
        value={selectedMetric}
        onValueChange={(value: typeof selectedMetric) =>
          setSelectedMetric(value)
        }
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='engagement' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Engagement
          </TabsTrigger>
          <TabsTrigger value='attendance' className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Attendance
          </TabsTrigger>
          <TabsTrigger value='completion' className='flex items-center gap-2'>
            <Target className='h-4 w-4' />
            Completion
          </TabsTrigger>
        </TabsList>

        <TabsContent value='engagement' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64 flex items-center justify-center border rounded-lg bg-muted/50'>
                <div className='text-center'>
                  <LineChart className='h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50' />
                  <p className='text-muted-foreground'>
                    Engagement trend chart would be rendered here
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {filteredTrend.length} data points over {timeRange}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='attendance' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Attendance Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64 flex items-center justify-center border rounded-lg bg-muted/50'>
                <div className='text-center'>
                  <BarChart3 className='h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50' />
                  <p className='text-muted-foreground'>
                    Attendance pattern chart would be rendered here
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Average: {Math.round(cohort.attendanceRate)}% attendance
                    rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='completion' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Completion Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64 flex items-center justify-center border rounded-lg bg-muted/50'>
                <div className='text-center'>
                  <PieChart className='h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50' />
                  <p className='text-muted-foreground'>
                    Completion analysis chart would be rendered here
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {Math.round(cohort.completionRate)}% completion rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Award className='h-5 w-5' />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {cohort.topParticipants.slice(0, 5).map((participant, index) => (
              <div
                key={participant.id}
                className='flex items-center gap-3 p-3 border rounded-lg'
              >
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-muted'>
                  <span className='text-sm font-medium'>#{index + 1}</span>
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <h4 className='font-medium truncate'>{participant.name}</h4>
                    {index === 0 && (
                      <Badge variant='default' className='text-xs'>
                        <Award className='h-3 w-3 mr-1' />
                        Top Performer
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <span>{participant.meetingsAttended} sessions</span>
                    <span>
                      {Math.round(participant.averageEngagement)}% engagement
                    </span>
                    <span>{formatDuration(participant.totalDuration)}</span>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-sm font-medium'>
                    {Math.round(participant.averageEngagement)}%
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Avg Engagement
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison with Other Cohorts */}
      {comparisonCohorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cohort Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {comparisonCohorts.map((compareCohort) => (
                <div
                  key={compareCohort.cohortId}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div>
                    <h4 className='font-medium'>{compareCohort.name}</h4>
                    <p className='text-sm text-muted-foreground'>
                      {compareCohort.participantCount} participants •{" "}
                      {compareCohort.meetingCount} sessions
                    </p>
                  </div>

                  <div className='flex items-center gap-4 text-sm'>
                    <div className='text-center'>
                      <div className='font-medium'>
                        {Math.round(
                          compareCohort.performanceMetrics.averageEngagement
                        )}
                        %
                      </div>
                      <div className='text-muted-foreground'>Engagement</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-medium'>
                        {Math.round(compareCohort.attendanceRate)}%
                      </div>
                      <div className='text-muted-foreground'>Attendance</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-medium'>
                        {Math.round(compareCohort.completionRate)}%
                      </div>
                      <div className='text-muted-foreground'>Completion</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
