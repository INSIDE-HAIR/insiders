"use client";

import { Toaster, toast } from "sonner";

export type NotificationType = "success" | "error" | "loading";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationsProps {
  notifications?: Notification[];
  onDismiss?: (id: string) => void;
}

export function Notifications({
  notifications,
  onDismiss,
}: NotificationsProps) {
  return (
    <>
      <Toaster data-testid="sonner-toaster" />
      {notifications?.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg mb-2 ${
            notification.type === "success"
              ? "bg-green-100"
              : notification.type === "error"
              ? "bg-red-100"
              : "bg-blue-100"
          }`}
        >
          <div className="flex justify-between items-center">
            <p
              className={
                notification.type === "success"
                  ? "text-green-800"
                  : notification.type === "error"
                  ? "text-red-800"
                  : "text-blue-800"
              }
            >
              {notification.message}
            </p>
            {onDismiss && (
              <button
                onClick={() => onDismiss(notification.id)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export function useNotifications() {
  return {
    addNotification: (type: NotificationType, message: string): string => {
      switch (type) {
        case "success":
          return toast.success(message) as string;
        case "error":
          return toast.error(message) as string;
        case "loading":
          return toast.loading(message) as string;
        default:
          return toast.success(message) as string;
      }
    },
    dismissNotification: (id: string) => {
      toast.dismiss(id);
    },
    updateNotification: (
      id: string,
      type: NotificationType,
      message: string
    ): string => {
      toast.dismiss(id);
      switch (type) {
        case "success":
          return toast.success(message) as string;
        case "error":
          return toast.error(message) as string;
        case "loading":
          return toast.loading(message) as string;
        default:
          return toast.success(message) as string;
      }
    },
  };
}
