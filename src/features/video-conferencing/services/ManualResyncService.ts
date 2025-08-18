/**
 * Manual Resync Service
 * Handles manual synchronization of meeting data for specific date ranges
 */
import { VideoProvider } from "@prisma/client";
import { MeetingDataSyncService } from "./MeetingDataSyncService";
import { MeetingDataCollectionService } from "./MeetingDataCollectionService";

export interface ResyncRequest {
  id: string;
  provider: VideoProvider;
  videoSpaceId?: string;
  startDate: Date;
  endDate: Date;
  includeParticipants: boolean;
  includeRecordings: boolean;
  includeTranscriptions: boolean;
  forceUpdate: boolean;
  requestedBy: string;
  requestedAt: Date;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number; // 0-100
  totalMeetings: number;
  processedMeetings: number;
  duplicatesFound: number;
  duplicatesSkipped: number;
  errorsCount: number;
  errors: ResyncError[];
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number; // in milliseconds
}

export interface ResyncError {
  meetingId: string;
  error: string;
  timestamp: Date;
  retryable: boolean;
}

export interface ResyncResult {
  requestId: string;
  success: boolean;
  totalMeetings: number;
  processedMeetings: number;
  createdMeetings: number;
  updatedMeetings: number;
  duplicatesSkipped: number;
  errorsCount: number;
  errors: ResyncError[];
  duration: number; // in milliseconds
  startedAt: Date;
  completedAt: Date;
}

export interface ResyncStats {
  totalRequests: number;
  pendingRequests: number;
  runningRequests: number;
  completedRequests: number;
  failedRequests: number;
  cancelledRequests: number;
  averageDuration: number;
  totalMeetingsProcessed: number;
  totalDuplicatesFound: number;
  totalErrorsCount: number;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  existingMeetingId?: string;
  conflictFields: string[];
  confidence: number; // 0-1
}

export class ManualResyncService {
  private syncService: MeetingDataSyncService;
  private dataCollectionService: MeetingDataCollectionService;
  private resyncRequests = new Map<string, ResyncRequest>();
  private runningRequests = new Set<string>();
  private maxConcurrentRequests = 3;
  private duplicateCache = new Map<string, any>();

  constructor() {
    this.syncService = new MeetingDataSyncService();
    this.dataCollectionService = new MeetingDataCollectionService();
  }

  /**
   * Create a new manual resync request
   */
  async createResyncRequest(
    provider: VideoProvider,
    startDate: Date,
    endDate: Date,
    options: {
      videoSpaceId?: string;
      includeParticipants?: boolean;
      includeRecordings?: boolean;
      includeTranscriptions?: boolean;
      forceUpdate?: boolean;
      requestedBy: string;
    }
  ): Promise<string> {
    // Validate date range
    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    const maxDaysRange = 90; // Maximum 90 days range
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > maxDaysRange) {
      throw new Error(`Date range cannot exceed ${maxDaysRange} days`);
    }

    const requestId = this.generateRequestId();
    const request: ResyncRequest = {
      id: requestId,
      provider,
      videoSpaceId: options.videoSpaceId,
      startDate,
      endDate,
      includeParticipants: options.includeParticipants ?? true,
      includeRecordings: options.includeRecordings ?? true,
      includeTranscriptions: options.includeTranscriptions ?? true,
      forceUpdate: options.forceUpdate ?? false,
      requestedBy: options.requestedBy,
      requestedAt: new Date(),
      status: "pending",
      progress: 0,
      totalMeetings: 0,
      processedMeetings: 0,
      duplicatesFound: 0,
      duplicatesSkipped: 0,
      errorsCount: 0,
      errors: [],
    };

    this.resyncRequests.set(requestId, request);
    console.log(
      `Created resync request ${requestId} for ${provider} from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    // Start processing if we have capacity
    this.processNextRequest();

    return requestId;
  }

  /**
   * Get resync request status
   */
  getResyncRequest(requestId: string): ResyncRequest | null {
    return this.resyncRequests.get(requestId) || null;
  }

  /**
   * Get all resync requests
   */
  getAllResyncRequests(): ResyncRequest[] {
    return Array.from(this.resyncRequests.values());
  }

  /**
   * Cancel a resync request
   */
  async cancelResyncRequest(requestId: string): Promise<boolean> {
    const request = this.resyncRequests.get(requestId);
    if (!request) {
      return false;
    }

    if (request.status === "completed" || request.status === "failed") {
      return false;
    }

    if (request.status === "running") {
      // Mark for cancellation, the running process will check this
      request.status = "cancelled";
      this.runningRequests.delete(requestId);
      request.completedAt = new Date();
      console.log(`Cancelled running resync request ${requestId}`);
    } else {
      // Just mark as cancelled
      request.status = "cancelled";
      request.completedAt = new Date();
      console.log(`Cancelled pending resync request ${requestId}`);
    }

    return true;
  }

  /**
   * Get resync statistics
   */
  getResyncStats(): ResyncStats {
    const requests = Array.from(this.resyncRequests.values());

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(
      (r) => r.status === "pending"
    ).length;
    const runningRequests = requests.filter(
      (r) => r.status === "running"
    ).length;
    const completedRequests = requests.filter(
      (r) => r.status === "completed"
    ).length;
    const failedRequests = requests.filter((r) => r.status === "failed").length;
    const cancelledRequests = requests.filter(
      (r) => r.status === "cancelled"
    ).length;

    const completedRequestsWithDuration = requests.filter(
      (r) => r.status === "completed" && r.startedAt && r.completedAt
    );

    const averageDuration =
      completedRequestsWithDuration.length > 0
        ? completedRequestsWithDuration.reduce((sum, r) => {
            return sum + (r.completedAt!.getTime() - r.startedAt!.getTime());
          }, 0) / completedRequestsWithDuration.length
        : 0;

    const totalMeetingsProcessed = requests.reduce(
      (sum, r) => sum + r.processedMeetings,
      0
    );
    const totalDuplicatesFound = requests.reduce(
      (sum, r) => sum + r.duplicatesFound,
      0
    );
    const totalErrorsCount = requests.reduce(
      (sum, r) => sum + r.errorsCount,
      0
    );

    return {
      totalRequests,
      pendingRequests,
      runningRequests,
      completedRequests,
      failedRequests,
      cancelledRequests,
      averageDuration,
      totalMeetingsProcessed,
      totalDuplicatesFound,
      totalErrorsCount,
    };
  }

  /**
   * Retry a failed resync request
   */
  async retryResyncRequest(requestId: string): Promise<boolean> {
    const request = this.resyncRequests.get(requestId);
    if (!request || request.status !== "failed") {
      return false;
    }

    // Reset request state
    request.status = "pending";
    request.progress = 0;
    request.processedMeetings = 0;
    request.duplicatesFound = 0;
    request.duplicatesSkipped = 0;
    request.errorsCount = 0;
    request.errors = [];
    request.startedAt = undefined;
    request.completedAt = undefined;
    request.estimatedTimeRemaining = undefined;

    console.log(`Retrying resync request ${requestId}`);
    this.processNextRequest();

    return true;
  }

  /**
   * Clean up old completed requests
   */
  cleanupOldRequests(olderThanDays: number = 30): number {
    const cutoffDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000
    );
    let cleanedCount = 0;

    for (const [requestId, request] of this.resyncRequests.entries()) {
      if (
        (request.status === "completed" ||
          request.status === "failed" ||
          request.status === "cancelled") &&
        request.completedAt &&
        request.completedAt < cutoffDate
      ) {
        this.resyncRequests.delete(requestId);
        cleanedCount++;
      }
    }

    console.log(`Cleaned up ${cleanedCount} old resync requests`);
    return cleanedCount;
  }

  // Private methods

  private async processNextRequest(): Promise<void> {
    if (this.runningRequests.size >= this.maxConcurrentRequests) {
      return;
    }

    // Find next pending request
    const pendingRequest = Array.from(this.resyncRequests.values())
      .filter((r) => r.status === "pending")
      .sort((a, b) => a.requestedAt.getTime() - b.requestedAt.getTime())[0];

    if (!pendingRequest) {
      return;
    }

    this.runningRequests.add(pendingRequest.id);
    await this.executeResyncRequest(pendingRequest);
    this.runningRequests.delete(pendingRequest.id);

    // Process next request if any
    setTimeout(() => this.processNextRequest(), 100);
  }

  private async executeResyncRequest(request: ResyncRequest): Promise<void> {
    request.status = "running";
    request.startedAt = new Date();
    request.progress = 0;

    try {
      console.log(
        `Starting resync request ${request.id} for ${request.provider}`
      );

      // Get meetings for the date range
      const meetings = await this.fetchMeetingsForDateRange(
        request.provider,
        request.startDate,
        request.endDate,
        request.videoSpaceId
      );

      request.totalMeetings = meetings.length;
      console.log(
        `Found ${meetings.length} meetings to process for request ${request.id}`
      );

      if (meetings.length === 0) {
        request.status = "completed";
        request.completedAt = new Date();
        request.progress = 100;
        return;
      }

      // Process meetings in batches
      const batchSize = 10;
      for (let i = 0; i < meetings.length; i += batchSize) {
        // Check if request was cancelled
        if (request.status === "cancelled") {
          console.log(`Resync request ${request.id} was cancelled`);
          return;
        }

        const batch = meetings.slice(i, i + batchSize);
        await this.processMeetingBatch(request, batch);

        // Update progress
        request.progress = Math.round(
          (request.processedMeetings / request.totalMeetings) * 100
        );

        // Update estimated time remaining
        if (request.startedAt && request.processedMeetings > 0) {
          const elapsed = Date.now() - request.startedAt.getTime();
          const avgTimePerMeeting = elapsed / request.processedMeetings;
          const remainingMeetings =
            request.totalMeetings - request.processedMeetings;
          request.estimatedTimeRemaining = Math.round(
            avgTimePerMeeting * remainingMeetings
          );
        }

        // Small delay between batches to avoid overwhelming the APIs
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      request.status = "completed";
      request.completedAt = new Date();
      request.progress = 100;
      console.log(
        `Completed resync request ${request.id}: ${request.processedMeetings} meetings processed, ${request.duplicatesSkipped} duplicates skipped, ${request.errorsCount} errors`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Resync request ${request.id} failed:`, errorMessage);

      request.status = "failed";
      request.completedAt = new Date();
      request.errors.push({
        meetingId: "N/A",
        error: errorMessage,
        timestamp: new Date(),
        retryable: true,
      });
      request.errorsCount++;
    }
  }

  private async processMeetingBatch(
    request: ResyncRequest,
    meetings: any[]
  ): Promise<void> {
    for (const meetingData of meetings) {
      try {
        // Check for duplicates unless force update is enabled
        if (!request.forceUpdate) {
          const duplicateResult = await this.detectDuplicate(meetingData);
          if (duplicateResult.isDuplicate) {
            request.duplicatesFound++;
            request.duplicatesSkipped++;
            request.processedMeetings++;
            console.log(
              `Skipping duplicate meeting ${meetingData.meetingId} (confidence: ${duplicateResult.confidence})`
            );
            continue;
          }
        }

        // Process the meeting
        await this.processSingleMeeting(request, meetingData);
        request.processedMeetings++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Error processing meeting ${meetingData.meetingId}:`,
          errorMessage
        );

        request.errors.push({
          meetingId: meetingData.meetingId,
          error: errorMessage,
          timestamp: new Date(),
          retryable: true,
        });
        request.errorsCount++;
        request.processedMeetings++;
      }
    }
  }

  private async processSingleMeeting(
    request: ResyncRequest,
    meetingData: any
  ): Promise<void> {
    // Create a webhook event for the sync service
    const webhookEvent = {
      id: `resync_${request.id}_${meetingData.meetingId}`,
      provider: request.provider,
      eventType: "meeting.started",
      meetingId: meetingData.meetingId,
      userId: undefined,
      timestamp: new Date(),
      payload: meetingData,
      processed: false,
      retryCount: 0,
    };

    const syncOptions = {
      forceUpdate: request.forceUpdate,
      includeParticipants: request.includeParticipants,
      includeRecordings: request.includeRecordings,
      includeTranscriptions: request.includeTranscriptions,
    };

    const result = await this.syncService.syncFromWebhook(
      webhookEvent,
      syncOptions
    );

    if (!result.success) {
      throw new Error(result.error || "Sync failed");
    }
  }

  private async fetchMeetingsForDateRange(
    provider: VideoProvider,
    startDate: Date,
    endDate: Date,
    videoSpaceId?: string
  ): Promise<any[]> {
    try {
      // Use the data collection service to fetch meetings
      if (videoSpaceId) {
        return await this.dataCollectionService.fetchMeetingsForVideoSpace(
          provider,
          videoSpaceId,
          startDate,
          endDate
        );
      } else {
        return await this.dataCollectionService.fetchMeetingsForProvider(
          provider,
          startDate,
          endDate
        );
      }
    } catch (error) {
      console.error(`Failed to fetch meetings for ${provider}:`, error);
      throw error;
    }
  }

  private async detectDuplicate(
    meetingData: any
  ): Promise<DuplicateDetectionResult> {
    const cacheKey = `${meetingData.provider}_${meetingData.meetingId}`;

    // Check cache first
    if (this.duplicateCache.has(cacheKey)) {
      return {
        isDuplicate: true,
        existingMeetingId: this.duplicateCache.get(cacheKey),
        conflictFields: [],
        confidence: 1.0,
      };
    }

    // Check database for existing meeting
    const existingMeeting = await this.findExistingMeeting(meetingData);

    if (existingMeeting) {
      // Cache the result
      this.duplicateCache.set(cacheKey, existingMeeting.id);

      // Analyze conflicts
      const conflictFields = this.analyzeConflicts(
        existingMeeting,
        meetingData
      );
      const confidence = this.calculateDuplicateConfidence(
        existingMeeting,
        meetingData
      );

      return {
        isDuplicate: true,
        existingMeetingId: existingMeeting.id,
        conflictFields,
        confidence,
      };
    }

    return {
      isDuplicate: false,
      conflictFields: [],
      confidence: 0,
    };
  }

  private async findExistingMeeting(meetingData: any): Promise<any | null> {
    // Mock implementation - in real app, this would query the database
    // Look for meetings with same external ID or similar start time and title
    console.log(`Checking for existing meeting: ${meetingData.meetingId}`);
    return null; // No duplicates found
  }

  private analyzeConflicts(
    existingMeeting: any,
    newMeetingData: any
  ): string[] {
    const conflicts: string[] = [];

    // Compare key fields
    if (existingMeeting.title !== newMeetingData.title) {
      conflicts.push("title");
    }

    if (existingMeeting.startTime !== newMeetingData.startTime) {
      conflicts.push("startTime");
    }

    if (existingMeeting.duration !== newMeetingData.duration) {
      conflicts.push("duration");
    }

    return conflicts;
  }

  private calculateDuplicateConfidence(
    existingMeeting: any,
    newMeetingData: any
  ): number {
    let score = 0;
    let totalChecks = 0;

    // Check external ID match
    if (existingMeeting.externalId === newMeetingData.meetingId) {
      score += 0.5;
    }
    totalChecks++;

    // Check title similarity
    if (existingMeeting.title === newMeetingData.title) {
      score += 0.3;
    }
    totalChecks++;

    // Check start time proximity (within 5 minutes)
    const timeDiff = Math.abs(
      new Date(existingMeeting.startTime).getTime() -
        new Date(newMeetingData.startTime).getTime()
    );
    if (timeDiff < 5 * 60 * 1000) {
      // 5 minutes
      score += 0.2;
    }
    totalChecks++;

    return Math.min(score, 1.0);
  }

  private generateRequestId(): string {
    return `resync_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
