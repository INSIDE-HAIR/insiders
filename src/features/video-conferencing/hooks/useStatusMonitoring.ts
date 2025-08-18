/**
 * Status Monitoring Hook
 * React hook for real-time status monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoProvider, VideoSpaceStatus } from '@prisma/client';

export interface StatusUpdate {
  id: string;
  name: string;
  provider: VideoProvider;
  previousStatus: VideoSpaceStatus;
  currentStatus: VideoSpaceStatus;
  lastActiveAt: string | null;
  error?: string;
}

export interface StatusMonitoringResult {
  statusUpdates: StatusUpdate[];
  summary: {
    total: number;
    updated: number;
    active: number;
    inactive: number;
    errors: number;
  };
  timestamp: string;
}

export interface StatusSummary {
  summary: {
    byStatus: Record<string, number>;
    byProvider: Record<string, number>;
    byProviderAndStatus: Record<string, Record<string, number>>;
    total: number;
  };
  recentActivity: Array<{
    id: string;
    name: string;
    provider: VideoProvider;
    status: VideoSpaceStatus;
    lastActiveAt: string | null;
  }>;
  timestamp: string;
}

export interface UseStatusMonitoringOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  videoSpaceIds?: string[];
}

export function useStatusMonitoring(options: UseStatusMonitoringOptions = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    videoSpaceIds = []
  } = options;

  const [statusData, setStatusData] = useState<StatusMonitoringResult | null>(null);
  const [statusSummary, setStatusSummary] = useState<StatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Check status for multiple video spaces
   */
  const checkMultipleStatus = useCallback(async (ids: string[] = videoSpaceIds) => {
    if (ids.length === 0) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/video-conferencing/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoSpaceIds: ids }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check status');
      }

      const result: StatusMonitoringResult = await response.json();
      setStatusData(result);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [videoSpaceIds]);

  /**
   * Check status for a single video space
   */
  const checkSingleStatus = useCallback(async (videoSpaceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/video-conferencing/monitoring/${videoSpaceId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check status');
      }

      const result: StatusUpdate = await response.json();
      setLastUpdated(new Date());
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get status summary
   */
  const getStatusSummary = useCallback(async (includeAll: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/video-conferencing/monitoring${includeAll ? '?includeAll=true' : ''}`;\n      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get status summary');
      }

      const result: StatusSummary = await response.json();
      setStatusSummary(result);
      setLastUpdated(new Date());
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start monitoring for a video space
   */
  const startMonitoring = useCallback(async (videoSpaceId: string, intervalMs?: number) => {
    try {
      const response = await fetch(`/api/video-conferencing/monitoring/${videoSpaceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'start',
          intervalMs 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start monitoring');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Stop monitoring for a video space
   */
  const stopMonitoring = useCallback(async (videoSpaceId: string) => {
    try {
      const response = await fetch(`/api/video-conferencing/monitoring/${videoSpaceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to stop monitoring');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Stop all monitoring
   */
  const stopAllMonitoring = useCallback(async () => {
    try {
      const response = await fetch('/api/video-conferencing/monitoring/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stopAll' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to stop all monitoring');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(() => {
    if (videoSpaceIds.length > 0) {
      checkMultipleStatus(videoSpaceIds);
    }
    getStatusSummary();
  }, [checkMultipleStatus, getStatusSummary, videoSpaceIds]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Initial load
  useEffect(() => {
    if (videoSpaceIds.length > 0) {
      checkMultipleStatus(videoSpaceIds);
    }
    getStatusSummary();
  }, [videoSpaceIds]); // Only depend on videoSpaceIds to avoid infinite loops

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data
    statusData,
    statusSummary,
    isLoading,
    error,
    lastUpdated,

    // Actions
    checkMultipleStatus,
    checkSingleStatus,
    getStatusSummary,
    startMonitoring,
    stopMonitoring,
    stopAllMonitoring,
    refresh,

    // Utilities
    clearError: () => setError(null)
  };
}