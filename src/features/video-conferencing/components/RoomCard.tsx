"use client";

import React, { useState } from "react";
import { VideoProvider, VideoSpaceStatus } from "@prisma/client";
import {
  ExternalLink,
  Copy,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";
import { VideoSpace } from "../types/video-conferencing";
import { useVideoSpaceStatus } from "../hooks/useVideoSpaceStatus";
import { formatDistanceToNow } from "date-fns";

interface RoomCardProps {
  room: VideoSpace;
  onClick?: () => void;
  onUpdate?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onClick,
  onUpdate,
  showActions = true,
  compact = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const { status: realTimeStatus, isLoading: statusLoading } =
    useVideoSpaceStatus(room.id);

  const getProviderInfo = (provider: VideoProvider) => {
    switch (provider) {
      case "ZOOM":
        return {
          name: "Zoom",
          icon: "🔵",
          color: "bg-blue-100 text-blue-800",
          borderColor: "border-blue-200",
        };
      case "MEET":
        return {
          name: "Google Meet",
          icon: "🟢",
          color: "bg-green-100 text-green-800",
          borderColor: "border-green-200",
        };
      case "VIMEO":
        return {
          name: "Vimeo",
          icon: "🔷",
          color: "bg-indigo-100 text-indigo-800",
          borderColor: "border-indigo-200",
        };
      default:
        return {
          name: provider,
          icon: "📹",
          color: "bg-gray-100 text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  const getStatusInfo = (status: VideoSpaceStatus) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: "🟢",
        };
      case "INACTIVE":
        return {
          label: "Inactive",
          color: "text-gray-500",
          bgColor: "bg-gray-100",
          icon: "⚪",
        };
      case "ERROR":
        return {
          label: "Error",
          color: "text-red-600",
          bgColor: "bg-red-100",
          icon: "🔴",
        };
      default:
        return {
          label: "Unknown",
          color: "text-gray-400",
          bgColor: "bg-gray-100",
          icon: "❓",
        };
    }
  };

  const providerInfo = getProviderInfo(room.provider);
  const currentStatus = realTimeStatus || room.status;
  const statusInfo = getStatusInfo(currentStatus);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${type} copied!`);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopyFeedback("Failed to copy");
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const handleJoinRoom = () => {
    if (room.joinUrl) {
      window.open(room.joinUrl, "_blank", "noopener,noreferrer");
    }
  };

  const formatLastActivity = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div
      className={`
      bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg
      ${providerInfo.borderColor}
      ${onClick ? "cursor-pointer hover:border-opacity-60" : ""}
      ${compact ? "p-4" : "p-6"}
    `}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center space-x-3 flex-1 min-w-0'>
          <div
            className={`
            flex items-center justify-center w-10 h-10 rounded-lg text-lg
            ${providerInfo.color}
          `}
          >
            {providerInfo.icon}
          </div>
          <div className='flex-1 min-w-0'>
            <h3
              className='font-semibold text-gray-900 truncate'
              title={room.title}
            >
              {room.title}
            </h3>
            <div className='flex items-center space-x-2 mt-1'>
              <span className='text-sm text-gray-500'>{providerInfo.name}</span>
              {room.alias && (
                <>
                  <span className='text-gray-300'>•</span>
                  <span className='text-sm text-blue-600 font-mono'>
                    /{room.alias}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status and Menu */}
        <div className='flex items-center space-x-2'>
          <div
            className={`
            flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
            ${statusInfo.bgColor} ${statusInfo.color}
          `}
          >
            {statusLoading ? (
              <div className='w-2 h-2 bg-current rounded-full animate-pulse' />
            ) : (
              <span>{statusInfo.icon}</span>
            )}
            <span>{statusInfo.label}</span>
          </div>

          {showActions && (
            <div className='relative'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className='p-1 text-gray-400 hover:text-gray-600 rounded'
              >
                <MoreVertical className='w-4 h-4' />
              </button>

              {showMenu && (
                <div className='absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick?.();
                      setShowMenu(false);
                    }}
                    className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2'
                  >
                    <Eye className='w-4 h-4' />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit
                      setShowMenu(false);
                    }}
                    className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2'
                  >
                    <Edit className='w-4 h-4' />
                    <span>Edit Room</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete
                      setShowMenu(false);
                    }}
                    className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2'
                  >
                    <Trash2 className='w-4 h-4' />
                    <span>Delete Room</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {room.description && !compact && (
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
          {room.description}
        </p>
      )}

      {/* Room Info */}
      {!compact && (
        <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
          <div className='flex items-center space-x-2 text-gray-600'>
            <Users className='w-4 h-4' />
            <span>Max: {room.maxParticipants || "Unlimited"}</span>
          </div>
          <div className='flex items-center space-x-2 text-gray-600'>
            <Clock className='w-4 h-4' />
            <span>
              Duration: {room.duration ? `${room.duration}min` : "No limit"}
            </span>
          </div>
          {room.lastActivity && (
            <div className='flex items-center space-x-2 text-gray-600 col-span-2'>
              <Calendar className='w-4 h-4' />
              <span>
                Last activity: {formatLastActivity(room.lastActivity)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {currentStatus === "ERROR" && room.lastError && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <div className='flex items-start space-x-2'>
            <AlertCircle className='w-4 h-4 text-red-600 mt-0.5 flex-shrink-0' />
            <div>
              <p className='text-sm font-medium text-red-800'>
                Connection Error
              </p>
              <p className='text-xs text-red-600 mt-1'>{room.lastError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
        <div className='flex items-center space-x-2'>
          {room.joinUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleJoinRoom();
              }}
              className='flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors'
            >
              <ExternalLink className='w-3 h-3' />
              <span>Join</span>
            </button>
          )}

          {room.alias && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(
                  `${window.location.origin}/room/${room.alias}`,
                  "Room link"
                );
              }}
              className='flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors'
            >
              <Copy className='w-3 h-3' />
              <span>Copy Link</span>
            </button>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className='text-gray-400 hover:text-gray-600 p-1 rounded'
          title='Room settings'
        >
          <Settings className='w-4 h-4' />
        </button>
      </div>

      {/* Copy Feedback */}
      {copyFeedback && (
        <div className='absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg'>
          {copyFeedback}
        </div>
      )}

      {/* Click overlay for card selection */}
      {onClick && (
        <div className='absolute inset-0 cursor-pointer' onClick={onClick} />
      )}
    </div>
  );
};
