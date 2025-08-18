/**
 * Status Dashboard Component
 * Real-time monitoring dashboard for video spaces
 */

"use client";

import React, { useState, useEffect } from "react";
import { VideoProvider, VideoSpaceStatus } from "@prisma/client";
import { useStatusMonitoring } from "../hooks/useStatusMonitoring";

interface StatusDashboardProps {
  videoSpaceIds?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  showRecentActivity?: boolean;
  className?: string;
}

const statusColors = {
  ACTIVE: "text-green-600 bg-green-100",
  INACTIVE: "text-gray-600 bg-gray-100",
  DISABLED: "text-red-600 bg-red-100",
  EXPIRED: "text-yellow-600 bg-yellow-100",
};

const providerColors = {
  ZOOM: "text-blue-600 bg-blue-100",
  MEET: "text-green-600 bg-green-100",
  VIMEO: "text-purple-600 bg-purple-100",
};

export function StatusDashboard({
  videoSpaceIds = [],
  autoRefresh = true,
  refreshInterval = 30000,
  showRecentActivity = true,
  className = "",
}: StatusDashboardProps) {
  const [selectedProvider, setSelectedProvider] = useState<
    VideoProvider | "ALL"
  >("ALL");
  const [selectedStatus, setSelectedStatus] = useState<
    VideoSpaceStatus | "ALL"
  >("ALL");

  const {
    statusData,
    statusSummary,
    isLoading,
    error,
    lastUpdated,
    checkMultipleStatus,
    getStatusSummary,
    refresh,
  } = useStatusMonitoring({
    autoRefresh,
    refreshInterval,
    videoSpaceIds,
  });

  // Manual refresh
  const handleRefresh = () => {
    refresh();
  };

  // Filter recent activity
  const filteredRecentActivity =
    statusSummary?.recentActivity.filter((activity) => {
      const providerMatch =
        selectedProvider === "ALL" || activity.provider === selectedProvider;
      const statusMatch =
        selectedStatus === "ALL" || activity.status === selectedStatus;
      return providerMatch && statusMatch;
    }) || [];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Status Dashboard</h2>
          <p className='text-sm text-gray-500'>
            Real-time monitoring of video conferencing spaces
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {lastUpdated && (
            <span className='text-sm text-gray-500'>
              Last updated: {formatTimestamp(lastUpdated.toISOString())}
            </span>
          )}

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg border
              ${
                isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }
              transition-colors duration-200
            `}
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center gap-2'>
            <svg
              className='w-5 h-5 text-red-600'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-red-800 font-medium'>Error</span>
          </div>
          <p className='text-red-700 mt-1'>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {statusSummary && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Total Spaces */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Spaces
                </p>
                <p className='text-3xl font-bold text-gray-900'>
                  {statusSummary.summary.total}
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-blue-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Spaces */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Active</p>
                <p className='text-3xl font-bold text-green-600'>
                  {statusSummary.summary.byStatus.ACTIVE || 0}
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <div className='w-3 h-3 bg-green-600 rounded-full'></div>
              </div>
            </div>
          </div>

          {/* Inactive Spaces */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Inactive</p>
                <p className='text-3xl font-bold text-gray-600'>
                  {statusSummary.summary.byStatus.INACTIVE || 0}
                </p>
              </div>
              <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center'>
                <div className='w-3 h-3 bg-gray-600 rounded-full'></div>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Issues</p>
                <p className='text-3xl font-bold text-red-600'>
                  {(statusSummary.summary.byStatus.DISABLED || 0) +
                    (statusSummary.summary.byStatus.EXPIRED || 0)}
                </p>
              </div>
              <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-red-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Breakdown */}
      {statusSummary && (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Provider Breakdown
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {Object.entries(statusSummary.summary.byProvider).map(
              ([provider, count]) => (
                <div
                  key={provider}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-3 h-3 rounded-full ${providerColors[provider as VideoProvider]}`}
                    ></div>
                    <span className='font-medium text-gray-900'>
                      {provider}
                    </span>
                  </div>
                  <span className='text-2xl font-bold text-gray-900'>
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {showRecentActivity && statusSummary && (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Recent Activity
            </h3>

            {/* Filters */}
            <div className='flex items-center gap-3'>
              <select
                value={selectedProvider}
                onChange={(e) =>
                  setSelectedProvider(e.target.value as VideoProvider | "ALL")
                }
                className='text-sm border border-gray-300 rounded-md px-3 py-1'
              >
                <option value='ALL'>All Providers</option>
                <option value='ZOOM'>Zoom</option>
                <option value='MEET'>Google Meet</option>
                <option value='VIMEO'>Vimeo</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as VideoSpaceStatus | "ALL")
                }
                className='text-sm border border-gray-300 rounded-md px-3 py-1'
              >
                <option value='ALL'>All Statuses</option>
                <option value='ACTIVE'>Active</option>
                <option value='INACTIVE'>Inactive</option>
                <option value='DISABLED'>Disabled</option>
                <option value='EXPIRED'>Expired</option>
              </select>
            </div>
          </div>

          {filteredRecentActivity.length > 0 ? (
            <div className='space-y-3'>
              {filteredRecentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-3 h-3 rounded-full ${statusColors[activity.status]}`}
                    ></div>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {activity.name}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {activity.provider}
                      </p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <p
                      className={`text-sm font-medium ${statusColors[activity.status]}`}
                    >
                      {activity.status}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {formatLastActive(activity.lastActiveAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <svg
                className='w-12 h-12 mx-auto mb-4 text-gray-300'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3'
                />
              </svg>
              <p>No recent activity found</p>
            </div>
          )}
        </div>
      )}

      {/* Status Updates (if checking specific spaces) */}
      {statusData && (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Status Updates
            <span className='ml-2 text-sm font-normal text-gray-500'>
              ({statusData.summary.updated} updated, {statusData.summary.errors}{" "}
              errors)
            </span>
          </h3>

          <div className='space-y-3'>
            {statusData.statusUpdates.map((update) => (
              <div
                key={update.id}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-3 h-3 rounded-full ${statusColors[update.currentStatus]}`}
                  ></div>
                  <div>
                    <p className='font-medium text-gray-900'>{update.name}</p>
                    <p className='text-sm text-gray-500'>{update.provider}</p>
                  </div>
                </div>

                <div className='text-right'>
                  {update.previousStatus !== update.currentStatus ? (
                    <div className='flex items-center gap-2'>
                      <span
                        className={`text-xs px-2 py-1 rounded ${statusColors[update.previousStatus]}`}
                      >
                        {update.previousStatus}
                      </span>
                      <span className='text-gray-400'>→</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${statusColors[update.currentStatus]}`}
                      >
                        {update.currentStatus}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`text-xs px-2 py-1 rounded ${statusColors[update.currentStatus]}`}
                    >
                      {update.currentStatus}
                    </span>
                  )}

                  {update.error && (
                    <p className='text-xs text-red-600 mt-1'>{update.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusDashboard;
