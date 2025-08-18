/**
 * Resync Status API Endpoint
 * GET /api/video-conferencing/resync/status
 */
import { NextRequest, NextResponse } from 'next/server';
import { ManualResyncService } from '@/features/video-conferencing/services/ManualResyncService';
import { VideoProvider } from '@prisma/client';

// Initialize resync service
const resyncService = new ManualResyncService();

// GET - Get detailed resync status and tracking information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const includeErrors = searchParams.get('includeErrors') === 'true';
    const errorLimit = parseInt(searchParams.get('errorLimit') || '50');

    if (requestId) {
      // Get specific request status
      const resyncRequest = resyncService.getResyncRequest(requestId);
      
      if (!resyncRequest) {
        return NextResponse.json(
          {
            success: false,
            error: 'Resync request not found',
          },
          { status: 404 }
        );
      }

      // Prepare response data
      const responseData: any = {
        request: {
          id: resyncRequest.id,
          provider: resyncRequest.provider,
          videoSpaceId: resyncRequest.videoSpaceId,
          startDate: resyncRequest.startDate.toISOString(),
          endDate: resyncRequest.endDate.toISOString(),
          status: resyncRequest.status,
          progress: resyncRequest.progress,
          requestedBy: resyncRequest.requestedBy,
          requestedAt: resyncRequest.requestedAt.toISOString(),
          startedAt: resyncRequest.startedAt?.toISOString(),
          completedAt: resyncRequest.completedAt?.toISOString(),
          estimatedTimeRemaining: resyncRequest.estimatedTimeRemaining,
        },
        metrics: {
          totalMeetings: resyncRequest.totalMeetings,
          processedMeetings: resyncRequest.processedMeetings,
          duplicatesFound: resyncRequest.duplicatesFound,
          duplicatesSkipped: resyncRequest.duplicatesSkipped,
          errorsCount: resyncRequest.errorsCount,
        },
        options: {
          includeParticipants: resyncRequest.includeParticipants,
          includeRecordings: resyncRequest.includeRecordings,
          includeTranscriptions: resyncRequest.includeTranscriptions,
          forceUpdate: resyncRequest.forceUpdate,
        },
      };

      // Add duration if completed
      if (resyncRequest.startedAt && resyncRequest.completedAt) {
        responseData.metrics.duration = resyncRequest.completedAt.getTime() - resyncRequest.startedAt.getTime();
      }

      // Add errors if requested
      if (includeErrors && resyncRequest.errors.length > 0) {
        responseData.errors = resyncRequest.errors
          .slice(0, errorLimit)
          .map(error => ({
            meetingId: error.meetingId,
            error: error.error,
            timestamp: error.timestamp.toISOString(),
            retryable: error.retryable,
          }));
        
        responseData.errorsSummary = {
          totalErrors: resyncRequest.errors.length,
          retryableErrors: resyncRequest.errors.filter(e => e.retryable).length,
          nonRetryableErrors: resyncRequest.errors.filter(e => !e.retryable).length,
          errorsByType: this.groupErrorsByType(resyncRequest.errors),
        };
      }

      return NextResponse.json({
        success: true,
        data: responseData,
      });

    } else {
      // Get overall status dashboard
      const stats = resyncService.getResyncStats();
      const allRequests = resyncService.getAllResyncRequests();

      // Group requests by status
      const requestsByStatus = {
        pending: allRequests.filter(r => r.status === 'pending'),
        running: allRequests.filter(r => r.status === 'running'),
        completed: allRequests.filter(r => r.status === 'completed'),
        failed: allRequests.filter(r => r.status === 'failed'),
        cancelled: allRequests.filter(r => r.status === 'cancelled'),
      };

      // Group requests by provider
      const requestsByProvider = {
        ZOOM: allRequests.filter(r => r.provider === 'ZOOM'),
        MEET: allRequests.filter(r => r.provider === 'MEET'),
        VIMEO: allRequests.filter(r => r.provider === 'VIMEO'),
      };

      // Calculate success rate
      const totalCompleted = stats.completedRequests + stats.failedRequests;
      const successRate = totalCompleted > 0 ? (stats.completedRequests / totalCompleted) * 100 : 0;

      // Get recent activity (last 24 hours)
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentRequests = allRequests.filter(r => r.requestedAt > last24Hours);

      // Get current running requests with progress
      const runningRequestsWithProgress = requestsByStatus.running.map(r => ({
        id: r.id,
        provider: r.provider,
        progress: r.progress,
        processedMeetings: r.processedMeetings,
        totalMeetings: r.totalMeetings,
        estimatedTimeRemaining: r.estimatedTimeRemaining,
        startedAt: r.startedAt?.toISOString(),
      }));

      // Get error summary for failed requests
      const errorSummary = this.getErrorSummary(requestsByStatus.failed);

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            ...stats,
            successRate: Math.round(successRate * 100) / 100,
            last24HoursRequests: recentRequests.length,
          },
          breakdown: {
            byStatus: {
              pending: requestsByStatus.pending.length,
              running: requestsByStatus.running.length,
              completed: requestsByStatus.completed.length,
              failed: requestsByStatus.failed.length,
              cancelled: requestsByStatus.cancelled.length,
            },
            byProvider: {
              ZOOM: requestsByProvider.ZOOM.length,
              MEET: requestsByProvider.MEET.length,
              VIMEO: requestsByProvider.VIMEO.length,
            },
          },
          currentActivity: {
            runningRequests: runningRequestsWithProgress,
            queuedRequests: requestsByStatus.pending.length,
          },
          errorSummary,
          recentActivity: recentRequests
            .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
            .slice(0, 10)
            .map(r => ({
              id: r.id,
              provider: r.provider,
              status: r.status,
              requestedAt: r.requestedAt.toISOString(),
              completedAt: r.completedAt?.toISOString(),
              processedMeetings: r.processedMeetings,
              errorsCount: r.errorsCount,
            })),
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Resync status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get resync status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }

  // Helper method to group errors by type
  private groupErrorsByType(errors: any[]): Record<string, number> {
    const errorGroups: Record<string, number> = {};
    
    for (const error of errors) {
      // Extract error type from error message
      let errorType = 'Unknown';
      
      if (error.error.includes('Authentication')) {
        errorType = 'Authentication';
      } else if (error.error.includes('Rate limit')) {
        errorType = 'Rate Limit';
      } else if (error.error.includes('Not found')) {
        errorType = 'Not Found';
      } else if (error.error.includes('Network')) {
        errorType = 'Network';
      } else if (error.error.includes('Validation')) {
        errorType = 'Validation';
      } else if (error.error.includes('Permission')) {
        errorType = 'Permission';
      }
      
      errorGroups[errorType] = (errorGroups[errorType] || 0) + 1;
    }
    
    return errorGroups;
  }

  // Helper method to get error summary for failed requests
  private getErrorSummary(failedRequests: any[]): any {
    if (failedRequests.length === 0) {
      return {
        totalFailedRequests: 0,
        totalErrors: 0,
        commonErrors: [],
        errorsByProvider: {},
      };
    }

    const allErrors = failedRequests.flatMap(r => r.errors);
    const errorsByProvider: Record<string, number> = {};
    const errorMessages: Record<string, number> = {};

    for (const request of failedRequests) {
      errorsByProvider[request.provider] = (errorsByProvider[request.provider] || 0) + 1;
      
      for (const error of request.errors) {
        errorMessages[error.error] = (errorMessages[error.error] || 0) + 1;
      }
    }

    // Get most common errors
    const commonErrors = Object.entries(errorMessages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    return {
      totalFailedRequests: failedRequests.length,
      totalErrors: allErrors.length,
      commonErrors,
      errorsByProvider,
      retryableErrors: allErrors.filter(e => e.retryable).length,
      nonRetryableErrors: allErrors.filter(e => !e.retryable).length,
    };
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}