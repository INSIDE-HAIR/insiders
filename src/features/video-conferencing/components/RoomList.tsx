"use client";

import React, { useState, useEffect, useMemo } from "react";
import { VideoProvider, VideoSpaceStatus } from "@prisma/client";
import { Search, Filter, Plus, RefreshCw } from "lucide-react";
import { RoomCard } from "./RoomCard";
import { RoomForm } from "./RoomForm";
import { useVideoSpaces } from "../hooks/useVideoSpaces";
import { VideoSpace } from "../types/video-conferencing";

interface RoomListProps {
  className?: string;
  onRoomSelect?: (room: VideoSpace) => void;
  showCreateButton?: boolean;
  showFilters?: boolean;
  initialProvider?: VideoProvider;
}

interface FilterState {
  provider: VideoProvider | "ALL";
  status: VideoSpaceStatus | "ALL";
  search: string;
}

export const RoomList: React.FC<RoomListProps> = ({
  className = "",
  onRoomSelect,
  showCreateButton = true,
  showFilters = true,
  initialProvider,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    provider: initialProvider || "ALL",
    status: "ALL",
    search: "",
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: rooms,
    isLoading,
    error,
    refetch,
  } = useVideoSpaces({
    provider: filters.provider !== "ALL" ? filters.provider : undefined,
    status: filters.status !== "ALL" ? filters.status : undefined,
    search: filters.search || undefined,
  });

  // Filter rooms based on search and filters
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];

    return rooms.filter((room) => {
      const matchesSearch =
        !filters.search ||
        room.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.description
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        room.alias?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesProvider =
        filters.provider === "ALL" || room.provider === filters.provider;
      const matchesStatus =
        filters.status === "ALL" || room.status === filters.status;

      return matchesSearch && matchesProvider && matchesStatus;
    });
  }, [rooms, filters]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRoomCreated = () => {
    setShowCreateForm(false);
    refetch();
  };

  const getProviderIcon = (provider: VideoProvider) => {
    switch (provider) {
      case "ZOOM":
        return "🔵";
      case "MEET":
        return "🟢";
      case "VIMEO":
        return "🔷";
      default:
        return "📹";
    }
  };

  const getStatusColor = (status: VideoSpaceStatus) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600";
      case "INACTIVE":
        return "text-gray-500";
      case "ERROR":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  if (error) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className='text-red-600 mb-4'>
          <p className='text-lg font-semibold'>Error loading rooms</p>
          <p className='text-sm'>{error.message}</p>
        </div>
        <button
          onClick={handleRefresh}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Video Rooms</h2>
          <p className='text-gray-600 mt-1'>
            Manage your video conferencing spaces across all platforms
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
            title='Refresh rooms'
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
          {showCreateButton && (
            <button
              onClick={() => setShowCreateForm(true)}
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Plus className='w-4 h-4' />
              <span>Create Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className='bg-white p-4 rounded-lg border border-gray-200 space-y-4'>
          <div className='flex items-center space-x-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search rooms by title, description, or alias...'
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Provider Filter */}
            <div className='flex items-center space-x-2'>
              <Filter className='w-4 h-4 text-gray-400' />
              <select
                value={filters.provider}
                onChange={(e) => handleFilterChange("provider", e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='ALL'>All Providers</option>
                <option value='ZOOM'>🔵 Zoom</option>
                <option value='MEET'>🟢 Google Meet</option>
                <option value='VIMEO'>🔷 Vimeo</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='ALL'>All Status</option>
              <option value='ACTIVE'>🟢 Active</option>
              <option value='INACTIVE'>⚪ Inactive</option>
              <option value='ERROR'>🔴 Error</option>
            </select>
          </div>

          {/* Active Filters Summary */}
          {(filters.search ||
            filters.provider !== "ALL" ||
            filters.status !== "ALL") && (
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <span>Active filters:</span>
              {filters.search && (
                <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded'>
                  Search: "{filters.search}"
                </span>
              )}
              {filters.provider !== "ALL" && (
                <span className='px-2 py-1 bg-green-100 text-green-800 rounded'>
                  Provider: {getProviderIcon(filters.provider as VideoProvider)}{" "}
                  {filters.provider}
                </span>
              )}
              {filters.status !== "ALL" && (
                <span
                  className={`px-2 py-1 bg-gray-100 rounded ${getStatusColor(filters.status as VideoSpaceStatus)}`}
                >
                  Status: {filters.status}
                </span>
              )}
              <button
                onClick={() =>
                  setFilters({ provider: "ALL", status: "ALL", search: "" })
                }
                className='text-blue-600 hover:text-blue-800 underline'
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Loading rooms...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRooms.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            <div className='text-6xl mb-4'>📹</div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {filters.search ||
              filters.provider !== "ALL" ||
              filters.status !== "ALL"
                ? "No rooms match your filters"
                : "No video rooms yet"}
            </h3>
            <p className='text-gray-600 max-w-md mx-auto'>
              {filters.search ||
              filters.provider !== "ALL" ||
              filters.status !== "ALL"
                ? "Try adjusting your search criteria or filters to find rooms."
                : "Create your first video room to get started with video conferencing management."}
            </p>
          </div>
          {showCreateButton &&
            !filters.search &&
            filters.provider === "ALL" &&
            filters.status === "ALL" && (
              <button
                onClick={() => setShowCreateForm(true)}
                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Create Your First Room
              </button>
            )}
        </div>
      )}

      {/* Room Grid */}
      {!isLoading && filteredRooms.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onClick={() => onRoomSelect?.(room)}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filteredRooms.length > 0 && (
        <div className='text-center text-sm text-gray-600'>
          Showing {filteredRooms.length} of {rooms?.length || 0} rooms
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <RoomForm
              onSuccess={handleRoomCreated}
              onCancel={() => setShowCreateForm(false)}
              initialProvider={
                filters.provider !== "ALL"
                  ? (filters.provider as VideoProvider)
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
