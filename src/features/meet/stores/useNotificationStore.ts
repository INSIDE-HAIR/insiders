import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds
  persistent?: boolean; // if true, won't auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
  dismissedAt?: Date;
}

export interface NotificationProgress {
  id: string;
  title: string;
  message?: string;
  progress: number; // 0-100
  indeterminate?: boolean;
  canCancel?: boolean;
  onCancel?: () => void;
}

interface NotificationState {
  // Active notifications
  notifications: Notification[];
  
  // Progress notifications (for long-running operations)
  progressNotifications: NotificationProgress[];
  
  // System status
  isOnline: boolean;
  lastSync?: Date;
  syncError?: string;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  
  // Progress notifications
  startProgress: (progress: Omit<NotificationProgress, 'id'>) => string;
  updateProgress: (id: string, updates: Partial<NotificationProgress>) => void;
  completeProgress: (id: string, finalMessage?: string) => void;
  cancelProgress: (id: string) => void;
  
  // System status
  setOnlineStatus: (online: boolean) => void;
  setLastSync: (date: Date) => void;
  setSyncError: (error: string | null) => void;
  
  // Convenience methods
  showSuccess: (title: string, message?: string, action?: Notification['action']) => void;
  showError: (title: string, message?: string, persistent?: boolean) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  
  // Utilities
  getActiveNotifications: () => Notification[];
  getProgressNotifications: () => NotificationProgress[];
  hasNotifications: () => boolean;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      progressNotifications: [],
      isOnline: navigator.onLine,
      lastSync: undefined,
      syncError: undefined,

      // Notification actions
      addNotification: (notification) => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date(),
          duration: notification.duration || 5000, // Default 5 seconds
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));
        
        // Auto-dismiss if not persistent
        if (!newNotification.persistent && (newNotification.duration || 0) > 0) {
          setTimeout(() => {
            get().dismissNotification(id);
          }, newNotification.duration);
        }
        
        return id;
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, dismissedAt: new Date() } : n
          ).filter(n => !n.dismissedAt),
        }));
      },

      dismissAllNotifications: () => {
        set({ notifications: [] });
      },

      // Progress notifications
      startProgress: (progress) => {
        const id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newProgress: NotificationProgress = {
          ...progress,
          id,
          progress: progress.progress || 0,
        };
        
        set((state) => ({
          progressNotifications: [...state.progressNotifications, newProgress],
        }));
        
        return id;
      },

      updateProgress: (id, updates) => {
        set((state) => ({
          progressNotifications: state.progressNotifications.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      completeProgress: (id, finalMessage) => {
        const progress = get().progressNotifications.find(p => p.id === id);
        if (progress) {
          // Show success notification
          get().showSuccess(
            progress.title,
            finalMessage || `${progress.title} completado correctamente`
          );
        }
        
        // Remove progress notification
        set((state) => ({
          progressNotifications: state.progressNotifications.filter(p => p.id !== id),
        }));
      },

      cancelProgress: (id) => {
        const progress = get().progressNotifications.find(p => p.id === id);
        if (progress?.onCancel) {
          progress.onCancel();
        }
        
        set((state) => ({
          progressNotifications: state.progressNotifications.filter(p => p.id !== id),
        }));
      },

      // System status
      setOnlineStatus: (online) => set({ isOnline: online }),
      setLastSync: (date) => set({ lastSync: date }),
      setSyncError: (error) => set({ syncError: error || undefined }),

      // Convenience methods
      showSuccess: (title, message, action) => {
        get().addNotification({
          type: "success",
          title,
          message,
          action,
          duration: 4000,
        });
      },

      showError: (title, message, persistent = false) => {
        get().addNotification({
          type: "error",
          title,
          message,
          persistent,
          duration: persistent ? 0 : 8000,
        });
      },

      showWarning: (title, message) => {
        get().addNotification({
          type: "warning",
          title,
          message,
          duration: 6000,
        });
      },

      showInfo: (title, message) => {
        get().addNotification({
          type: "info",
          title,
          message,
          duration: 5000,
        });
      },

      // Utilities
      getActiveNotifications: () => {
        return get().notifications.filter(n => !n.dismissedAt);
      },

      getProgressNotifications: () => {
        return get().progressNotifications;
      },

      hasNotifications: () => {
        const state = get();
        return state.notifications.length > 0 || state.progressNotifications.length > 0;
      },

      clearAll: () => {
        set({
          notifications: [],
          progressNotifications: [],
          syncError: undefined,
        });
      },
    }),
    {
      name: 'meet-notification-store',
    }
  )
);

// Listen to online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useNotificationStore.getState().setOnlineStatus(true);
    useNotificationStore.getState().showSuccess('Conexión restaurada', 'Vuelves a estar en línea');
  });

  window.addEventListener('offline', () => {
    useNotificationStore.getState().setOnlineStatus(false);
    useNotificationStore.getState().showWarning('Sin conexión', 'Trabajando sin conexión a Internet');
  });
}