"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  Notifications,
  useNotifications,
} from "../components/ui/Notifications";
import { HierarchyItem } from "@drive/types/hierarchy";
import { DriveType } from "@drive/types/drive";
import { ViewSelector } from "../components/views/ViewSelector";

interface FolderDetails {
  id: string;
  name: string;
  hierarchy: HierarchyItem[];
}

export default function FolderDetailsPage() {
  const params = useParams();
  const folderId = params?.id as string;
  const fetchingRef = useRef(false);
  const notificationsRef = useRef<{
    addNotification: (typeof useNotifications)["prototype"]["addNotification"];
    updateNotification: (typeof useNotifications)["prototype"]["updateNotification"];
  }>();

  const [folderDetails, setFolderDetails] = useState<FolderDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notifications = useNotifications();

  // Mantener una referencia estable a las funciones de notificación
  useEffect(() => {
    notificationsRef.current = {
      addNotification: notifications.addNotification,
      updateNotification: notifications.updateNotification,
    };
  }, [notifications.addNotification, notifications.updateNotification]);

  const fetchFolderDetails = useCallback(async () => {
    if (fetchingRef.current || !notificationsRef.current) return;
    if (!folderId) return;

    fetchingRef.current = true;
    const notificationId = notificationsRef.current.addNotification(
      "loading",
      "Loading folder details..."
    );

    try {
      const response = await fetch(`/api/drive/folders/${folderId}/hierarchy`);
      if (!response.ok) {
        throw new Error("Failed to fetch folder details");
      }
      const data = await response.json();
      console.log("API Response:", data); // Debug log

      // Asegurarse de que la jerarquía es un array
      const hierarchy = Array.isArray(data.hierarchy)
        ? data.hierarchy
        : [data.root];

      setFolderDetails({
        id: data.id || folderId,
        name: data.name || "Root Folder",
        hierarchy: hierarchy,
      });

      setError(null);
      notificationsRef.current.updateNotification(
        notificationId,
        "success",
        "Folder details loaded successfully"
      );
    } catch (err) {
      console.error("Error fetching folder details:", err); // Debug log
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      if (notificationsRef.current) {
        notificationsRef.current.updateNotification(
          notificationId,
          "error",
          message
        );
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [folderId]);

  useEffect(() => {
    if (folderId) {
      fetchFolderDetails();
    }
  }, [folderId, fetchFolderDetails]);

  const handleItemClick = useCallback(async (item: HierarchyItem) => {
    if (!notificationsRef.current || item.driveType !== DriveType.FILE) return;

    const notificationId = notificationsRef.current.addNotification(
      "loading",
      `Loading ${item.displayName}...`
    );

    try {
      // Simular carga de documento
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notificationsRef.current.updateNotification(
        notificationId,
        "success",
        `${item.displayName} loaded successfully`
      );
    } catch (err) {
      if (notificationsRef.current) {
        notificationsRef.current.updateNotification(
          notificationId,
          "error",
          `Failed to load ${item.displayName}`
        );
      }
    }
  }, []);

  // Mostrar error si existe
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/drive"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to drive"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-red-600">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/drive"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to drive"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">
            {folderDetails?.name || "Loading..."}
          </h1>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          /* Hierarchy Viewer */
          folderDetails && (
            <div className="bg-white rounded-lg shadow">
              <ViewSelector
                hierarchy={folderDetails.hierarchy}
                onItemClick={handleItemClick}
              />
            </div>
          )
        )}
      </div>

      {/* Notifications */}
      <Notifications />
    </>
  );
}
