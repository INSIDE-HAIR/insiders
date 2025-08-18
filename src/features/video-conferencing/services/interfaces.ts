/**
 * Video Conferencing Services - Core Interfaces
 * Defines contracts for all video conferencing services
 */

import type {
  VideoSpace,
  VideoSpaceSettings,
  MeetingRecord,
  MeetingParticipant,
  MeetingTranscriptEntry,
  MeetingChatMessage,
  MeetingRecordingFile,
  IntegrationAccount,
  LinkAlias,
  CreateVideoSpaceRequest,
  UpdateVideoSpaceRequest,
  VideoSpaceFilters,
  MeetingAnalytics,
  ParticipantAnalytics,
  CohortStats,
  AnalyticsFilters,
  ReportFilters,
  ExportFormat,
  ServiceResponse,
  PaginatedResponse,
  RealTimeStatus,
  VideoProvider,
  VideoSpaceStatus,
  CalendarIntegrationData,
  DateRange,
  EngagementMetrics,
} from "../types";

// =============================================================================
// Main Service Interface
// =============================================================================

export interface IVideoConferencingService {
  // Video Space Management
  createVideoSpace(
    data: CreateVideoSpaceRequest
  ): Promise<ServiceResponse<VideoSpace>>;
  getVideoSpaces(
    filters: VideoSpaceFilters
  ): Promise<ServiceResponse<PaginatedResponse<VideoSpace>>>;
  getVideoSpace(id: string): Promise<ServiceResponse<VideoSpace>>;
  updateVideoSpace(
    id: string,
    data: UpdateVideoSpaceRequest
  ): Promise<ServiceResponse<VideoSpace>>;
  deleteVideoSpace(id: string): Promise<ServiceResponse<void>>;

  // Real-time Status
  getRealTimeStatus(id: string): Promise<ServiceResponse<RealTimeStatus>>;
  getRealTimeStatusBatch(
    ids: string[]
  ): Promise<ServiceResponse<RealTimeStatus[]>>;

  // Meeting Data Synchronization
  syncMeetingData(
    spaceId: string,
    dateRange?: DateRange
  ): Promise<ServiceResponse<MeetingRecord[]>>;
  syncAllMeetingData(dateRange?: DateRange): Promise<ServiceResponse<number>>;

  // Alias Management
  createAlias(
    videoSpaceId: string,
    alias: string
  ): Promise<ServiceResponse<LinkAlias>>;
  getAliases(videoSpaceId: string): Promise<ServiceResponse<LinkAlias[]>>;
  updateAlias(
    id: string,
    isActive: boolean
  ): Promise<ServiceResponse<LinkAlias>>;
  resolveAlias(alias: string): Promise<ServiceResponse<VideoSpace>>;

  // Calendar Integration
  getCalendarIntegrationData(
    id: string
  ): Promise<ServiceResponse<CalendarIntegrationData>>;
  markAddedToCalendar(
    id: string,
    eventId?: string
  ): Promise<ServiceResponse<VideoSpace>>;
}

// =============================================================================
// Provider Service Interface
// =============================================================================

export interface IProviderService<TConfig = any, TResponse = any> {
  readonly provider: VideoProvider;

  // Authentication
  authenticate(integrationAccountId: string): Promise<ServiceResponse<boolean>>;
  refreshToken(integrationAccountId: string): Promise<ServiceResponse<boolean>>;

  // Room Management
  createRoom(
    config: TConfig,
    integrationAccountId: string
  ): Promise<ServiceResponse<TResponse>>;
  updateRoom(
    roomId: string,
    config: Partial<TConfig>,
    integrationAccountId: string
  ): Promise<ServiceResponse<TResponse>>;
  deleteRoom(
    roomId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<void>>;
  getRoomStatus(
    roomId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<VideoSpaceStatus>>;

  // Meeting Data
  getMeetingRecords(
    roomId: string,
    dateRange?: DateRange,
    integrationAccountId?: string
  ): Promise<ServiceResponse<MeetingRecord[]>>;
  getParticipants(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingParticipant[]>>;
  getTranscripts(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingTranscriptEntry[]>>;
  getChatMessages(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingChatMessage[]>>;
  getRecordings(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingRecordingFile[]>>;

  // Validation
  validateConfig(config: TConfig): Promise<ServiceResponse<boolean>>;
  getSupportedFeatures(): string[];
}

// =============================================================================
// Authentication Provider Interface
// =============================================================================

export interface IAuthProvider {
  readonly provider: VideoProvider;

  // OAuth Flow
  generateAuthUrl(
    scopes: string[],
    redirectUri: string,
    state?: string
  ): string;
  exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<
    ServiceResponse<{
      accessToken: string;
      refreshToken?: string;
      expiresAt: Date;
      scopes: string[];
      userInfo?: any;
    }>
  >;

  // Token Management
  refreshAccessToken(refreshToken: string): Promise<
    ServiceResponse<{
      accessToken: string;
      refreshToken?: string;
      expiresAt: Date;
    }>
  >;

  // Token Validation
  validateToken(accessToken: string): Promise<ServiceResponse<boolean>>;

  // Account Information
  getAccountInfo(accessToken: string): Promise<
    ServiceResponse<{
      accountId: string;
      accountName: string;
      accountEmail?: string;
      scopes: string[];
    }>
  >;

  // Required Scopes
  getRequiredScopes(): string[];
  validateScopes(scopes: string[]): boolean;
}

// =============================================================================
// Analytics Service Interface
// =============================================================================

export interface IAnalyticsService {
  // Meeting Analytics
  generateMeetingAnalytics(
    meetingId: string
  ): Promise<ServiceResponse<MeetingAnalytics>>;
  getMeetingAnalytics(
    filters: AnalyticsFilters
  ): Promise<ServiceResponse<PaginatedResponse<MeetingAnalytics>>>;

  // Participant Analytics
  getParticipantAnalytics(
    filters: AnalyticsFilters
  ): Promise<ServiceResponse<PaginatedResponse<ParticipantAnalytics>>>;
  getParticipantEngagement(
    participantId: string,
    dateRange?: DateRange
  ): Promise<ServiceResponse<EngagementMetrics>>;

  // Cohort Analytics
  getCohortStatistics(
    cohort: string,
    dateRange?: DateRange
  ): Promise<ServiceResponse<CohortStats>>;
  getCohortComparison(
    cohorts: string[],
    dateRange?: DateRange
  ): Promise<ServiceResponse<CohortStats[]>>;

  // Engagement Metrics
  getEngagementMetrics(
    spaceId: string,
    dateRange?: DateRange
  ): Promise<ServiceResponse<EngagementMetrics>>;
  getEngagementTrends(filters: AnalyticsFilters): Promise<
    ServiceResponse<
      Array<{
        date: Date;
        engagement: number;
        participantCount: number;
      }>
    >
  >;

  // Performance Analytics
  getPerformanceMetrics(filters: AnalyticsFilters): Promise<
    ServiceResponse<{
      averageJoinTime: number;
      connectionQuality: number;
      dropoutRate: number;
      technicalIssues: number;
    }>
  >;
}

// =============================================================================
// Reporting Service Interface
// =============================================================================

export interface IReportingService {
  // Report Generation
  generateReport(
    filters: ReportFilters,
    format: ExportFormat
  ): Promise<ServiceResponse<Buffer>>;
  generateMeetingReport(
    meetingId: string,
    format: ExportFormat
  ): Promise<ServiceResponse<Buffer>>;
  generateCohortReport(
    cohort: string,
    dateRange: DateRange,
    format: ExportFormat
  ): Promise<ServiceResponse<Buffer>>;

  // Data Export
  exportMeetingData(
    meetingId: string,
    includeTranscripts?: boolean,
    includeChatMessages?: boolean
  ): Promise<
    ServiceResponse<{
      meeting: MeetingRecord;
      participants: MeetingParticipant[];
      transcripts?: MeetingTranscriptEntry[];
      chatMessages?: MeetingChatMessage[];
      recordings: MeetingRecordingFile[];
    }>
  >;

  // File Downloads
  getRecordingDownloadUrl(
    recordingId: string,
    expiresIn?: number
  ): Promise<ServiceResponse<string>>;
  getTranscriptDownloadUrl(
    meetingId: string,
    format: "TXT" | "DOCX"
  ): Promise<ServiceResponse<string>>;

  // Bulk Operations
  bulkExport(
    filters: ReportFilters,
    format: ExportFormat
  ): Promise<
    ServiceResponse<{
      downloadUrl: string;
      expiresAt: Date;
      recordCount: number;
    }>
  >;
}

// =============================================================================
// Webhook Service Interface
// =============================================================================

export interface IWebhookService {
  // Webhook Processing
  processWebhook(
    provider: VideoProvider,
    payload: any,
    signature: string
  ): Promise<ServiceResponse<void>>;
  validateWebhookSignature(
    provider: VideoProvider,
    payload: string,
    signature: string
  ): Promise<ServiceResponse<boolean>>;

  // Event Handlers
  handleMeetingStarted(
    provider: VideoProvider,
    data: any
  ): Promise<ServiceResponse<void>>;
  handleMeetingEnded(
    provider: VideoProvider,
    data: any
  ): Promise<ServiceResponse<MeetingRecord>>;
  handleParticipantJoined(
    provider: VideoProvider,
    data: any
  ): Promise<ServiceResponse<MeetingParticipant>>;
  handleParticipantLeft(
    provider: VideoProvider,
    data: any
  ): Promise<ServiceResponse<void>>;
  handleRecordingReady(
    provider: VideoProvider,
    data: any
  ): Promise<ServiceResponse<MeetingRecordingFile>>;
  handleTranscriptReady(
    provider: VideoProvider,
    data: any
  ): Promise<ServiceResponse<MeetingTranscriptEntry[]>>;

  // Webhook Configuration
  configureWebhook(
    integrationAccountId: string,
    events: string[]
  ): Promise<ServiceResponse<void>>;
  getWebhookConfig(integrationAccountId: string): Promise<
    ServiceResponse<{
      webhookUrl: string;
      events: string[];
      isActive: boolean;
      lastDeliveryAt?: Date;
    }>
  >;

  // Manual Sync
  manualSync(
    spaceId: string,
    dateRange?: DateRange
  ): Promise<
    ServiceResponse<{
      meetingsProcessed: number;
      participantsProcessed: number;
      recordingsProcessed: number;
      transcriptsProcessed: number;
    }>
  >;
}

// =============================================================================
// Database Service Interfaces
// =============================================================================

export interface IVideoSpaceRepository {
  create(
    data: CreateVideoSpaceRequest & { ownerId: string }
  ): Promise<VideoSpace>;
  findById(id: string): Promise<VideoSpace | null>;
  findMany(
    filters: VideoSpaceFilters
  ): Promise<{ data: VideoSpace[]; total: number }>;
  update(id: string, data: Partial<VideoSpace>): Promise<VideoSpace>;
  delete(id: string): Promise<void>;
  findByProviderRoomId(
    providerRoomId: string,
    provider: VideoProvider
  ): Promise<VideoSpace | null>;
}

export interface IMeetingRecordRepository {
  create(
    data: Omit<MeetingRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<MeetingRecord>;
  findById(id: string): Promise<MeetingRecord | null>;
  findByVideoSpaceId(
    videoSpaceId: string,
    dateRange?: DateRange
  ): Promise<MeetingRecord[]>;
  findByProviderMeetingId(
    providerMeetingId: string,
    provider: VideoProvider
  ): Promise<MeetingRecord | null>;
  update(id: string, data: Partial<MeetingRecord>): Promise<MeetingRecord>;
  delete(id: string): Promise<void>;
}

export interface IIntegrationAccountRepository {
  create(
    data: Omit<IntegrationAccount, "id" | "createdAt" | "updatedAt">
  ): Promise<IntegrationAccount>;
  findById(id: string): Promise<IntegrationAccount | null>;
  findByUserAndProvider(
    userId: string,
    provider: VideoProvider
  ): Promise<IntegrationAccount[]>;
  update(
    id: string,
    data: Partial<IntegrationAccount>
  ): Promise<IntegrationAccount>;
  delete(id: string): Promise<void>;
  findActiveByProvider(provider: VideoProvider): Promise<IntegrationAccount[]>;
}
