/**
 * Implementación del servicio de Analytics para Google Meet
 * Implementa IAnalyticsService para métricas, estadísticas y reportes
 */

import {
  IAnalyticsService,
  ConferenceRecord,
  ParticipantSession,
  RoomAnalytics,
  GlobalAnalytics,
  AnalyticsFilters,
  ExportOptions,
} from "../interfaces/IAnalyticsService";

export class MeetAnalyticsService implements IAnalyticsService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = "/api/meet/analytics";
  }

  // Room-specific analytics
  async getRoomAnalytics(roomId: string, filters?: AnalyticsFilters): Promise<RoomAnalytics> {
    const params = this.buildFiltersParams(filters);
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get room analytics: ${response.status}`);
    }

    return response.json();
  }

  async getRoomConferences(roomId: string, filters?: AnalyticsFilters): Promise<ConferenceRecord[]> {
    const params = this.buildFiltersParams(filters);
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/conferences?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get room conferences: ${response.status}`);
    }

    const data = await response.json();
    return data.conferences || [];
  }

  async getRoomParticipants(roomId: string, filters?: AnalyticsFilters): Promise<ParticipantSession[]> {
    const params = this.buildFiltersParams(filters);
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/participants?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get room participants: ${response.status}`);
    }

    const data = await response.json();
    return data.participants || [];
  }

  // Global analytics
  async getGlobalAnalytics(filters?: AnalyticsFilters): Promise<GlobalAnalytics> {
    const params = this.buildFiltersParams(filters);
    const response = await fetch(`${this.baseUrl}/global?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get global analytics: ${response.status}`);
    }

    return response.json();
  }

  async getRoomComparison(roomIds: string[], filters?: AnalyticsFilters): Promise<Array<RoomAnalytics>> {
    const params = this.buildFiltersParams(filters);
    params.set("roomIds", roomIds.join(","));
    
    const response = await fetch(`${this.baseUrl}/comparison?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get room comparison: ${response.status}`);
    }

    const data = await response.json();
    return data.comparisons || [];
  }

  // Time-series data
  async getConferenceTrends(roomId?: string, period: "7d" | "30d" | "90d" | "1y" = "30d"): Promise<Array<{ date: string; count: number; duration: number }>> {
    const params = new URLSearchParams({ period });
    if (roomId) params.set("roomId", roomId);

    const response = await fetch(`${this.baseUrl}/trends/conferences?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get conference trends: ${response.status}`);
    }

    const data = await response.json();
    return data.trends || [];
  }

  async getParticipantTrends(roomId?: string, period: "7d" | "30d" | "90d" | "1y" = "30d"): Promise<Array<{ date: string; count: number; unique: number }>> {
    const params = new URLSearchParams({ period });
    if (roomId) params.set("roomId", roomId);

    const response = await fetch(`${this.baseUrl}/trends/participants?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get participant trends: ${response.status}`);
    }

    const data = await response.json();
    return data.trends || [];
  }

  async getUsagePeaks(roomId?: string, granularity: "hour" | "day" | "week" = "hour"): Promise<Array<{ period: string; usage: number }>> {
    const params = new URLSearchParams({ granularity });
    if (roomId) params.set("roomId", roomId);

    const response = await fetch(`${this.baseUrl}/peaks?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get usage peaks: ${response.status}`);
    }

    const data = await response.json();
    return data.peaks || [];
  }

  // Advanced analytics
  async getEngagementMetrics(roomId?: string, filters?: AnalyticsFilters): Promise<{
    averageAttention: number;
    dropOffPoints: Array<{ minute: number; dropOffRate: number }>;
    interactionRate: number;
    returnVisitorRate: number;
  }> {
    const params = this.buildFiltersParams(filters);
    if (roomId) params.set("roomId", roomId);

    const response = await fetch(`${this.baseUrl}/engagement?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get engagement metrics: ${response.status}`);
    }

    return response.json();
  }

  async getAudienceInsights(roomId?: string, filters?: AnalyticsFilters): Promise<{
    demographics: Record<string, any>;
    behaviorPatterns: Record<string, any>;
    segmentation: Record<string, any>;
  }> {
    const params = this.buildFiltersParams(filters);
    if (roomId) params.set("roomId", roomId);

    const response = await fetch(`${this.baseUrl}/audience?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get audience insights: ${response.status}`);
    }

    return response.json();
  }

  // Content analytics
  async getRecordingAnalytics(roomId?: string, filters?: AnalyticsFilters): Promise<{
    totalRecordings: number;
    totalWatchTime: number;
    averageCompletion: number;
    popularSegments: Array<{ start: number; end: number; views: number }>;
  }> {
    const params = this.buildFiltersParams(filters);
    if (roomId) params.set("roomId", roomId);

    const response = await fetch(`${this.baseUrl}/recordings?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get recording analytics: ${response.status}`);
    }

    return response.json();
  }

  async getTranscriptAnalytics(roomId?: string, filters?: AnalyticsFilters): Promise<{
    totalTranscripts: number;
    wordCount: number;
    keywordFrequency: Record<string, number>;
    sentimentAnalysis: { positive: number; neutral: number; negative: number };
  }> {
    const params = this.buildFiltersParams(filters);
    if (roomId) params.set("roomId", roomId);

    const response = await fetch(`${this.baseUrl}/transcripts?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get transcript analytics: ${response.status}`);
    }

    return response.json();
  }

  // Export and reporting
  async exportAnalytics(roomId: string | null, options: ExportOptions, filters?: AnalyticsFilters): Promise<Blob> {
    const params = this.buildFiltersParams(filters);
    params.set("format", options.format);
    
    if (roomId) params.set("roomId", roomId);
    if (options.includeCharts !== undefined) params.set("includeCharts", options.includeCharts.toString());
    if (options.includeRawData !== undefined) params.set("includeRawData", options.includeRawData.toString());
    if (options.customFields) params.set("customFields", options.customFields.join(","));
    if (options.groupBy) params.set("groupBy", options.groupBy);

    const response = await fetch(`${this.baseUrl}/export?${params.toString()}`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to export analytics: ${response.status}`);
    }

    return response.blob();
  }

  async generateReport(roomId: string | null, templateId: string, filters?: AnalyticsFilters): Promise<string> {
    const body: any = { templateId };
    if (roomId) body.roomId = roomId;
    if (filters) body.filters = filters;

    const response = await fetch(`${this.baseUrl}/reports/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to generate report: ${response.status}`);
    }

    const data = await response.json();
    return data.reportUrl;
  }

  async scheduleReport(roomId: string | null, schedule: "daily" | "weekly" | "monthly", recipients: string[]): Promise<string> {
    const body: any = { schedule, recipients };
    if (roomId) body.roomId = roomId;

    const response = await fetch(`${this.baseUrl}/reports/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to schedule report: ${response.status}`);
    }

    const data = await response.json();
    return data.scheduleId;
  }

  // Real-time analytics
  async getLiveRoomStats(roomId: string): Promise<{
    currentParticipants: number;
    duration: number;
    isRecording: boolean;
    quality: "good" | "fair" | "poor";
  }> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/live`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get live room stats: ${response.status}`);
    }

    return response.json();
  }

  subscribeToLiveUpdates(roomId: string, callback: (stats: any) => void): () => void {
    // This would typically use WebSocket or Server-Sent Events
    const eventSource = new EventSource(`${this.baseUrl}/rooms/${roomId}/live-stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const stats = JSON.parse(event.data);
        callback(stats);
      } catch (error) {
        console.error("Error parsing live stats:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Live updates error:", error);
    };

    // Return unsubscribe function
    return () => {
      eventSource.close();
    };
  }

  // Predictive analytics
  async predictRoomUsage(roomId: string, lookahead: "7d" | "30d" = "7d"): Promise<Array<{ date: string; predictedUsage: number; confidence: number }>> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/predictions?lookahead=${lookahead}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to predict room usage: ${response.status}`);
    }

    const data = await response.json();
    return data.predictions || [];
  }

  async getRecommendations(roomId?: string): Promise<Array<{ type: string; priority: "high" | "medium" | "low"; message: string; action?: string }>> {
    const params = new URLSearchParams();
    if (roomId) params.set("roomId", roomId);

    const response = await fetch(`${this.baseUrl}/recommendations?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get recommendations: ${response.status}`);
    }

    const data = await response.json();
    return data.recommendations || [];
  }

  // Helper method to build filter parameters
  private buildFiltersParams(filters?: AnalyticsFilters): URLSearchParams {
    const params = new URLSearchParams();
    
    if (!filters) return params;

    if (filters.roomIds) params.set("roomIds", filters.roomIds.join(","));
    if (filters.participantEmails) params.set("participantEmails", filters.participantEmails.join(","));
    if (filters.dateRange) {
      params.set("from", filters.dateRange.from.toISOString());
      params.set("to", filters.dateRange.to.toISOString());
    }
    if (filters.accessTypes) params.set("accessTypes", filters.accessTypes.join(","));
    if (filters.includeRecordings !== undefined) params.set("includeRecordings", filters.includeRecordings.toString());
    if (filters.includeTranscripts !== undefined) params.set("includeTranscripts", filters.includeTranscripts.toString());
    if (filters.minDuration) params.set("minDuration", filters.minDuration.toString());
    if (filters.minParticipants) params.set("minParticipants", filters.minParticipants.toString());

    return params;
  }
}