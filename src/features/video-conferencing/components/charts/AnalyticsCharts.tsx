/**
 * AnalyticsCharts Component
 * Visual charts and graphs for data visualization
 */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Users,
  Clock,
  Target,
  Download,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { formatDate, formatPercentage } from '@/lib/utils';
import type { EngagementTrendPoint } from '../../types/analytics';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

interface AnalyticsChartsProps {
  engagementTrend: EngagementTrendPoint[];
  attendanceData: ChartDataPoint[];
  completionData: ChartDataPoint[];
  providerDistribution: { provider: string; count: number; percentage: number }[];
  timeRange?: '7d' | '30d' | '90d' | 'all';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | 'all') => void;
  onExport?: (chartType: string) => void;
  className?: string;
}

export function AnalyticsCharts({
  engagementTrend,
  attendanceData,
  completionData,
  providerDistribution,
  timeRange = '30d',
  onTimeRangeChange,
  onExport,
  className
}: AnalyticsChartsProps) {
  const [selectedChart, setSelectedChart] = useState<'engagement' | 'attendance' | 'completion' | 'distribution'>('engagement');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getChartColor = (index: number) => {
    const colors = [
      'rgb(59, 130, 246)', // blue
      'rgb(16, 185, 129)', // green
      'rgb(245, 158, 11)', // yellow
      'rgb(239, 68, 68)',  // red
      'rgb(139, 92, 246)', // purple
      'rgb(236, 72, 153)', // pink
    ];
    return colors[index % colors.length];
  };

  const renderEngagementChart = () => {
    const maxValue = Math.max(...engagementTrend.map(point => point.engagementScore));
    const minValue = Math.min(...engagementTrend.map(point => point.engagementScore));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {engagementTrend.length} data points
            </Badge>
            <Badge variant="secondary">
              Avg: {Math.round(engagementTrend.reduce((sum, p) => sum + p.engagementScore, 0) / engagementTrend.length)}%
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Range: {Math.round(minValue)}% - {Math.round(maxValue)}%
          </div>
        </div>
        
        <div className="h-80 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6">
          <div className="h-full flex items-end justify-between gap-2">
            {engagementTrend.map((point, index) => {
              const height = ((point.engagementScore - minValue) / (maxValue - minValue)) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600 cursor-pointer relative group"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {Math.round(point.engagementScore)}% • {point.participantCount} participants
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-left">
                    {formatDate(point.date, 'short')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAttendanceChart = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {attendanceData.length} sessions
          </Badge>
          <div className="text-sm text-muted-foreground">
            Attendance patterns over time
          </div>
        </div>
        
        <div className="h-80 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Attendance Chart</h3>
              <p className="text-muted-foreground">
                Interactive attendance visualization would be rendered here
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>High Attendance (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Medium Attendance (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Low Attendance (<60%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompletionChart = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            Completion tracking
          </Badge>
          <div className="text-sm text-muted-foreground">
            Course completion rates
          </div>
        </div>
        
        <div className="h-80 border rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 p-6">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-purple-500 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Completion Analysis</h3>
              <p className="text-muted-foreground">
                Completion rate visualization would be rendered here
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">10%</div>
                  <div className="text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">5%</div>
                  <div className="text-muted-foreground">Dropped</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProviderDistribution = () => {
    const total = providerDistribution.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {providerDistribution.length} providers
          </Badge>
          <div className="text-sm text-muted-foreground">
            Total: {total} sessions
          </div>
        </div>
        
        <div className="h-80 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-6">
          <div className="h-full flex items-center">
            <div className="w-1/2 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                {providerDistribution.map((item, index) => {
                  const color = getChartColor(index);
                  const percentage = (item.count / total) * 100;
                  return (
                    <div
                      key={item.provider}
                      className="absolute inset-0 rounded-full border-8 transition-all hover:scale-105"
                      style={{
                        borderColor: color,
                        transform: `rotate(${index * (360 / providerDistribution.length)}deg)`,
                        borderTopColor: color,
                        borderRightColor: 'transparent',
                        borderBottomColor: 'transparent',
                        borderLeftColor: 'transparent'
                      }}
                    />
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-1/2 space-y-3">
              {providerDistribution.map((item, index) => (
                <div key={item.provider} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getChartColor(index) }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{item.provider}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: getChartColor(index)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const chartComponents = {
    engagement: renderEngagementChart,
    attendance: renderAttendanceChart,
    completion: renderCompletionChart,
    distribution: renderProviderDistribution
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Visual insights and trend analysis
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={timeRange} 
            onValueChange={(value: typeof timeRange) => onTimeRangeChange?.(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport(selectedChart)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Chart Navigation */}
      <Tabs value={selectedChart} onValueChange={(value: typeof selectedChart) => setSelectedChart(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="completion" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Completion
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Engagement Trend
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderEngagementChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Attendance Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderAttendanceChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Completion Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCompletionChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Provider Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderProviderDistribution()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Trend</span>
            </div>
            <div className="text-lg font-bold text-green-600">+12.5%</div>
            <div className="text-xs text-muted-foreground">vs last period</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Peak</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {Math.max(...engagementTrend.map(p => p.participantCount))}
            </div>
            <div className="text-xs text-muted-foreground">max participants</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Sessions</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {engagementTrend.reduce((sum, p) => sum + p.meetingCount, 0)}
            </div>
            <div className="text-xs text-muted-foreground">total meetings</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Average</span>
            </div>
            <div className="text-lg font-bold text-orange-600">
              {Math.round(engagementTrend.reduce((sum, p) => sum + p.engagementScore, 0) / engagementTrend.length)}%
            </div>
            <div className="text-xs text-muted-foreground">engagement</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}