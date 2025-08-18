/**
 * Status Monitoring Panel Component
 * Real-time status monitoring dashboard for video spaces
 */

import React, { useState, useMemo } from "react";
import { useStatusMonitoring } from "../hooks/useStatusMonitoring";
import { StatusBadge, StatusBadgeWithTime } from "./StatusBadge";
import { cn } from "@/lib/utils";
import type { VideoProvider, StatusUpdate } from "../types";

export interface StatusMonitoringPanelProps {
  videoSpaceIds?: string[];
  provider?: VideoProvider;
  autoStart?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function StatusMonitoringPanel({
  videoSpaceIds,
  provider,
  autoStart = true,
  refreshInterval = 30000,
  className,
}: StatusMonitoringPanelProps) {
  const [selectedProvider, setSelectedProvider] = useState<
    VideoProvider | undefined
  >(provider);
  const [showOnlyLive, setShowOnlyLive] = useState(false);

  const {
    statusUpdates,
    summary,
    isConnected,
    isLoading,
    error,
    lastUpdate,
    startMonitoring,
    stopMonitoring,
    refreshStatus,
    clearError,
  } = useStatusMonitoring({
    videoSpaceIds,
    provider: selectedProvider,
    interval: refreshInterval,
    autoStart,
    onError: (error) => {
      console.error("Status monitoring error:", error);
    },
  });

  // Filter status updates based on current filters
  const filteredStatusUpdates = useMemo(() => {
    let filtered = statusUpdates;

    if (showOnlyLive) {
      filtered = filtered.filter((update) => update.isLive);
    }

    return filtered.sort((a, b) => {
      // Sort by live status first, then by name
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [statusUpdates, showOnlyLive]);

  const formatLastUpdate = (timestamp: string | null) => {
    if (!timestamp) return "Never";

    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getConnectionStatusColor = () => {
    if (isLoading) return "text-yellow-600";
    if (error) return "text-red-600";
    if (isConnected) return "text-green-600";
    return "text-gray-600";
  };

  const getConnectionStatusText = () => {
    if (isLoading) return "Connecting...";
    if (error) return "Disconnected";
    if (isConnected) return "Connected";
    return "Disconnected";
  };

  return (
    <div className={cn("bg-white rounded-lg border shadow-sm", className)}>
      {/* Header */}
      <div className='p-4 border-b'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Real-time Status Monitoring
            </h3>
            <div className='flex items-center gap-2 mt-1'>
              <div
                className={cn(
                  "flex items-center gap-1",
                  getConnectionStatusColor()
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-gray-400",
                    isConnected && "animate-pulse"
                  )}
                />
                <span className='text-sm font-medium'>
                  {getConnectionStatusText()}
                </span>
              </div>
              {lastUpdate && (
                <span className='text-sm text-gray-500'>
                  • Last update: {formatLastUpdate(lastUpdate)}
                </span>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={refreshStatus}
              disabled={isLoading}
              className='px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>

            {isConnected ? (
              <button
                onClick={stopMonitoring}
                className='px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700'
              >
                Stop
              </button>
            ) : (
              <button
                onClick={startMonitoring}
                className='px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700'
              >
                Start
              </button>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-md'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-red-800'>{error}</p>
              <button
                onClick={clearError}
                className='text-red-600 hover:text-red-800'
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className='p-4 border-b bg-gray-50'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium text-gray-700'>
              Provider:
            </label>
            <select
              value={selectedProvider || ""}
              onChange={(e) =>
                setSelectedProvider(
                  (e.target.value as VideoProvider) || undefined
                )
              }
              className='px-2 py-1 text-sm border border-gray-300 rounded-md'
            >
              <option value=''>All Providers</option>
              <option value='MEET'>Google Meet</option>
              <option value='ZOOM'>Zoom</option>
              <option value='VIMEO'>Vimeo</option>
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='showOnlyLive'
              checked={showOnlyLive}
              onChange={(e) => setShowOnlyLive(e.target.checked)}
              className='rounded border-gray-300'
            />
            <label
              htmlFor='showOnlyLive'
              className='text-sm font-medium text-gray-700'
            >
              Show only live sessions
            </label>
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className='p-4 border-b'>
          <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>
                {summary.total}
              </div>
              <div className='text-sm text-gray-600'>Total</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {summary.live}
              </div>
              <div className='text-sm text-gray-600'>Live</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {summary.active}
              </div>
              <div className='text-sm text-gray-600'>Active</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-600'>
                {summary.inactive}
              </div>
              <div className='text-sm text-gray-600'>Inactive</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {summary.expired}
              </div>
              <div className='text-sm text-gray-600'>Expired</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600'>
                {summary.errors}
              </div>
              <div className='text-sm text-gray-600'>Errors</div>
            </div>
          </div>
        </div>
      )}

      {/* Status List */}
      <div className='divide-y'>
        {filteredStatusUpdates.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            {isLoading ? (
              <div className='flex items-center justify-center gap-2'>
                <div className='w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
                Loading status updates...
              </div>
            ) : showOnlyLive ? (
              "No live sessions found"
            ) : (
              "No video spaces found"
            )}
          </div>
        ) : (
          filteredStatusUpdates.map((update) => (
            <StatusUpdateRow key={update.id} update={update} />
          ))
        )}
      </div>
    </div>
  );
}

// Individual status update row component
function StatusUpdateRow({ update }: { update: StatusUpdate }) {
  const providerColors = {
    MEET: "text-blue-600 bg-blue-50",
    ZOOM: "text-indigo-600 bg-indigo-50",
    VIMEO: "text-purple-600 bg-purple-50",
  };

  return (
    <div className='p-4 hover:bg-gray-50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <StatusBadgeWithTime
            status={update.currentStatus}
            isLive={update.isLive}
            participantCount={update.participantCount}
            lastUpdate={update.lastActiveAt}
          />

          <div>
            <h4 className='font-medium text-gray-900'>{update.name}</h4>
            <div className='flex items-center gap-2 mt-1'>
              <span
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  providerColors[update.provider]
                )}
              >
                {update.provider}
              </span>

              {update.participantCount !== undefined && (
                <span className='text-sm text-gray-600'>
                  {update.participantCount} participant
                  {update.participantCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='text-right'>
          {update.previousStatus !== update.currentStatus && (
            <div className='text-sm text-gray-600'>
              Changed from{" "}
              <StatusBadge
                status={update.previousStatus}
                size='sm'
                className='mx-1'
              />
            </div>
          )}

          {update.error && (
            <div className='text-sm text-red-600 mt-1'>
              Error: {update.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
