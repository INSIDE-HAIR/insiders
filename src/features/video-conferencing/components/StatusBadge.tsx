/**
 * Status Badge Component
 * Displays real-time status for video spaces
 */

"use client";

import React, { useState, useEffect } from "react";
import { VideoSpaceStatus, VideoProvider } from "@prisma/client";
import { useStatusMonitoring } from "../hooks/useStatusMonitoring";

interface StatusBadgeProps {
  videoSpaceId: string;
  initialStatus: VideoSpaceStatus;
  provider: VideoProvider;
  showLastActive?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

const statusConfig = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "⚪",
  },
  DISABLED: {
    label: "Disabled",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "🔴",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "🟡",
  },
};

const providerConfig = {
  ZOOM: {
    name: "Zoom",
    icon: "📹",
    color: "text-blue-600",
  },
  MEET: {
    name: "Google Meet",
    icon: "📱",
    color: "text-green-600",
  },
  VIMEO: {
    name: "Vimeo",
    icon: "🎬",
    color: "text-purple-600",
  },
};

export function StatusBadge({
  videoSpaceId,
  initialStatus,
  provider,
  showLastActive = false,
  autoRefresh = false,
  refreshInterval = 30000,
  className = "",
}: StatusBadgeProps) {
  const [currentStatus, setCurrentStatus] =
    useState<VideoSpaceStatus>(initialStatus);
  const [lastActiveAt, setLastActiveAt] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { checkSingleStatus, error } = useStatusMonitoring({
    autoRefresh: false, // We'll handle refresh manually
  });

  // Manual status check
  const handleStatusCheck = async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const statusUpdate = await checkSingleStatus(videoSpaceId);
      setCurrentStatus(statusUpdate.currentStatus);
      setLastActiveAt(statusUpdate.lastActiveAt);
    } catch (err) {
      console.error("Failed to check status:", err);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(handleStatusCheck, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, videoSpaceId]);

  const statusInfo = statusConfig[currentStatus];
  const providerInfo = providerConfig[provider];

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
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Status Badge */}
      <div
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
          ${statusInfo.className}
          ${isChecking ? "opacity-50" : ""}
        `}
        title={`Status: ${statusInfo.label}${error ? ` (Error: ${error})` : ""}`}
      >
        <span className='text-xs'>{statusInfo.icon}</span>
        <span>{statusInfo.label}</span>
        {isChecking && (
          <div className='w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-1' />
        )}
      </div>

      {/* Provider Badge */}
      <div
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          bg-gray-50 text-gray-700 border border-gray-200
          ${providerInfo.color}
        `}
        title={`Provider: ${providerInfo.name}`}
      >
        <span className='text-xs'>{providerInfo.icon}</span>
        <span>{providerInfo.name}</span>
      </div>

      {/* Last Active */}
      {showLastActive && (
        <div
          className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-gray-500 bg-gray-50 border border-gray-200'
          title={`Last active: ${lastActiveAt ? new Date(lastActiveAt).toLocaleString() : "Never"}`}
        >
          <span className='text-xs'>🕒</span>
          <span>{formatLastActive(lastActiveAt)}</span>
        </div>
      )}

      {/* Manual Refresh Button */}
      <button
        onClick={handleStatusCheck}
        disabled={isChecking}
        className={`
          inline-flex items-center justify-center w-6 h-6 rounded-full
          text-gray-400 hover:text-gray-600 hover:bg-gray-100
          transition-colors duration-200
          ${isChecking ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        `}
        title='Refresh status'
      >
        <svg
          className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`}
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
      </button>

      {/* Error Indicator */}
      {error && (
        <div
          className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600'
          title={`Error: ${error}`}
        >
          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default StatusBadge;
