/**
 * Interface para servicios de Analytics de Meet
 * Define contratos para métricas, estadísticas y reportes
 */

export interface ConferenceRecord {
  id: string;
  roomId: string;
  startTime: Date;
  endTime?: Date;
  participantCount: number;
  duration?: number; // en segundos
  recordingUrl?: string;
  transcriptUrl?: string;
}

export interface ParticipantSession {
  participantId: string;
  email?: string;
  displayName?: string;
  joinTime: Date;
  leaveTime?: Date;
  duration: number; // en segundos
  role: "HOST" | "GUEST" | "VIEWER";
}

export interface RoomAnalytics {
  roomId: string;
  period: {
    from: Date;
    to: Date;
  };
  metrics: {
    totalConferences: number;
    totalParticipants: number;
    uniqueParticipants: number;
    totalDuration: number; // en segundos
    averageConferenceDuration: number;
    averageParticipantsPerConference: number;
    peakConcurrentParticipants: number;
  };
  recordings: {
    total: number;
    totalDuration: number;
    averageDuration: number;
  };
  transcripts: {
    total: number;
    totalWords: number;
    averageWordsPerTranscript: number;
  };
  smartNotes: {
    total: number;
    totalSummaries: number;
    averageLength: number;
  };
  participantEngagement: {
    averageSessionDuration: number;
    returnRate: number; // porcentaje de participantes que regresan
    dropOffRate: number; // porcentaje que se va antes de finalizar
  };
  timePatterns: {
    peakHours: Array<{ hour: number; count: number }>;
    peakDays: Array<{ day: string; count: number }>;
    averageStartTime: string;
    averageDuration: number;
  };
  trends: {
    conferenceCountTrend: "up" | "down" | "stable";
    participantTrend: "up" | "down" | "stable";
    engagementTrend: "up" | "down" | "stable";
  };
}

export interface GlobalAnalytics {
  period: {
    from: Date;
    to: Date;
  };
  overview: {
    totalRooms: number;
    activeRooms: number;
    totalConferences: number;
    totalParticipants: number;
    totalDuration: number;
  };
  roomDistribution: {
    byAccessType: Record<"OPEN" | "TRUSTED" | "RESTRICTED", number>;
    byStatus: Record<"active" | "inactive", number>;
    byUsage: Record<"high" | "medium" | "low" | "unused", number>;
  };
  featureUsage: {
    recordingEnabled: number;
    transcriptionEnabled: number;
    smartNotesEnabled: number;
    moderationEnabled: number;
  };
  topRooms: Array<{
    roomId: string;
    roomName: string;
    conferenceCount: number;
    participantCount: number;
    duration: number;
  }>;
  topParticipants: Array<{
    email: string;
    displayName?: string;
    conferenceCount: number;
    totalDuration: number;
    avgDuration: number;
  }>;
}

export interface AnalyticsFilters {
  roomIds?: string[];
  participantEmails?: string[];
  dateRange: {
    from: Date;
    to: Date;
  };
  accessTypes?: Array<"OPEN" | "TRUSTED" | "RESTRICTED">;
  includeRecordings?: boolean;
  includeTranscripts?: boolean;
  minDuration?: number; // en segundos
  minParticipants?: number;
}

export interface ExportOptions {
  format: "csv" | "json" | "pdf" | "xlsx";
  includeCharts?: boolean;
  includeRawData?: boolean;
  customFields?: string[];
  groupBy?: "room" | "participant" | "date" | "time";
}

/**
 * Interface para servicios de Analytics
 */
export interface IAnalyticsService {
  // Room-specific analytics
  getRoomAnalytics(roomId: string, filters?: AnalyticsFilters): Promise<RoomAnalytics>;
  getRoomConferences(roomId: string, filters?: AnalyticsFilters): Promise<ConferenceRecord[]>;
  getRoomParticipants(roomId: string, filters?: AnalyticsFilters): Promise<ParticipantSession[]>;
  
  // Global analytics
  getGlobalAnalytics(filters?: AnalyticsFilters): Promise<GlobalAnalytics>;
  getRoomComparison(roomIds: string[], filters?: AnalyticsFilters): Promise<Array<RoomAnalytics>>;
  
  // Time-series data
  getConferenceTrends(roomId?: string, period?: "7d" | "30d" | "90d" | "1y"): Promise<Array<{ date: string; count: number; duration: number }>>;
  getParticipantTrends(roomId?: string, period?: "7d" | "30d" | "90d" | "1y"): Promise<Array<{ date: string; count: number; unique: number }>>;
  getUsagePeaks(roomId?: string, granularity?: "hour" | "day" | "week"): Promise<Array<{ period: string; usage: number }>>;
  
  // Advanced analytics
  getEngagementMetrics(roomId?: string, filters?: AnalyticsFilters): Promise<{
    averageAttention: number;
    dropOffPoints: Array<{ minute: number; dropOffRate: number }>;
    interactionRate: number;
    returnVisitorRate: number;
  }>;
  
  getAudienceInsights(roomId?: string, filters?: AnalyticsFilters): Promise<{
    demographics: Record<string, any>;
    behaviorPatterns: Record<string, any>;
    segmentation: Record<string, any>;
  }>;
  
  // Content analytics
  getRecordingAnalytics(roomId?: string, filters?: AnalyticsFilters): Promise<{
    totalRecordings: number;
    totalWatchTime: number;
    averageCompletion: number;
    popularSegments: Array<{ start: number; end: number; views: number }>;
  }>;
  
  getTranscriptAnalytics(roomId?: string, filters?: AnalyticsFilters): Promise<{
    totalTranscripts: number;
    wordCount: number;
    keywordFrequency: Record<string, number>;
    sentimentAnalysis: { positive: number; neutral: number; negative: number };
  }>;
  
  // Export and reporting
  exportAnalytics(roomId: string | null, options: ExportOptions, filters?: AnalyticsFilters): Promise<Blob>;
  generateReport(roomId: string | null, templateId: string, filters?: AnalyticsFilters): Promise<string>; // Returns URL
  scheduleReport(roomId: string | null, schedule: "daily" | "weekly" | "monthly", recipients: string[]): Promise<string>; // Returns schedule ID
  
  // Real-time analytics
  getLiveRoomStats(roomId: string): Promise<{
    currentParticipants: number;
    duration: number;
    isRecording: boolean;
    quality: "good" | "fair" | "poor";
  }>;
  
  subscribeToLiveUpdates(roomId: string, callback: (stats: any) => void): () => void; // Returns unsubscribe function
  
  // Predictive analytics
  predictRoomUsage(roomId: string, lookahead?: "7d" | "30d"): Promise<Array<{ date: string; predictedUsage: number; confidence: number }>>;
  getRecommendations(roomId?: string): Promise<Array<{ type: string; priority: "high" | "medium" | "low"; message: string; action?: string }>>;
}