import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface RoomSettings {
  accessType: "OPEN" | "TRUSTED" | "RESTRICTED";
  entryPointAccess: "ALL" | "CREATOR_APP_ONLY";
  moderation: "ON" | "OFF";
  moderationRestrictions?: {
    chatRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
    reactionRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
    presentRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
    defaultJoinAsViewerType: "ON" | "OFF";
  };
  artifactConfig?: {
    recordingConfig?: { autoRecordingGeneration: "ON" | "OFF" };
    transcriptionConfig?: { autoTranscriptionGeneration: "ON" | "OFF" };
    smartNotesConfig?: { autoSmartNotesGeneration: "ON" | "OFF" };
  };
  attendanceReportGenerationType?: "GENERATE_REPORT" | "DO_NOT_GENERATE";
}

export interface GlobalPreferences {
  defaultAccessType: "OPEN" | "TRUSTED" | "RESTRICTED";
  defaultRecording: boolean;
  defaultTranscription: boolean;
  defaultSmartNotes: boolean;
  defaultModeration: boolean;
  autoSyncCalendar: boolean;
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
  language: "es" | "en";
}

interface SettingsState {
  // Room-specific settings
  roomSettings: Record<string, RoomSettings>; // key: roomId
  settingsLoading: boolean;
  settingsError: string | null;
  
  // Global preferences
  preferences: GlobalPreferences;
  preferencesLoading: boolean;
  preferencesError: string | null;
  
  // Form states for settings
  pendingChanges: Record<string, Partial<RoomSettings>>; // key: roomId
  hasUnsavedChanges: boolean;
  
  // Actions for room settings
  setRoomSettings: (roomId: string, settings: RoomSettings) => void;
  updateRoomSetting: (roomId: string, key: keyof RoomSettings, value: any) => void;
  setPendingChange: (roomId: string, key: keyof RoomSettings, value: any) => void;
  commitPendingChanges: (roomId: string) => void;
  discardPendingChanges: (roomId: string) => void;
  
  // Actions for global preferences
  setPreferences: (preferences: Partial<GlobalPreferences>) => void;
  updatePreference: <K extends keyof GlobalPreferences>(key: K, value: GlobalPreferences[K]) => void;
  resetPreferences: () => void;
  
  // Loading states
  setSettingsLoading: (loading: boolean) => void;
  setSettingsError: (error: string | null) => void;
  setPreferencesLoading: (loading: boolean) => void;
  setPreferencesError: (error: string | null) => void;
  
  // Utilities
  getRoomSettings: (roomId: string) => RoomSettings | undefined;
  getPendingChanges: (roomId: string) => Partial<RoomSettings>;
  hasRoomPendingChanges: (roomId: string) => boolean;
  getDefaultSettings: () => RoomSettings;
}

const defaultSettings: RoomSettings = {
  accessType: "TRUSTED",
  entryPointAccess: "ALL",
  moderation: "OFF",
  moderationRestrictions: {
    chatRestriction: "NO_RESTRICTION",
    reactionRestriction: "NO_RESTRICTION",
    presentRestriction: "NO_RESTRICTION",
    defaultJoinAsViewerType: "OFF",
  },
  artifactConfig: {
    recordingConfig: { autoRecordingGeneration: "OFF" },
    transcriptionConfig: { autoTranscriptionGeneration: "OFF" },
    smartNotesConfig: { autoSmartNotesGeneration: "OFF" },
  },
  attendanceReportGenerationType: "DO_NOT_GENERATE",
};

const defaultPreferences: GlobalPreferences = {
  defaultAccessType: "TRUSTED",
  defaultRecording: false,
  defaultTranscription: false,
  defaultSmartNotes: false,
  defaultModeration: false,
  autoSyncCalendar: true,
  notificationsEnabled: true,
  theme: "system",
  language: "es",
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        roomSettings: {},
        settingsLoading: false,
        settingsError: null,
        preferences: defaultPreferences,
        preferencesLoading: false,
        preferencesError: null,
        pendingChanges: {},
        hasUnsavedChanges: false,

        // Room settings actions
        setRoomSettings: (roomId, settings) => {
          set((state) => ({
            roomSettings: {
              ...state.roomSettings,
              [roomId]: settings,
            },
          }));
        },

        updateRoomSetting: (roomId, key, value) => {
          set((state) => {
            const currentSettings = state.roomSettings[roomId] || defaultSettings;
            const updatedSettings = { ...currentSettings, [key]: value };
            
            return {
              roomSettings: {
                ...state.roomSettings,
                [roomId]: updatedSettings,
              },
            };
          });
        },

        setPendingChange: (roomId, key, value) => {
          set((state) => {
            const currentPending = state.pendingChanges[roomId] || {};
            const updatedPending = { ...currentPending, [key]: value };
            
            return {
              pendingChanges: {
                ...state.pendingChanges,
                [roomId]: updatedPending,
              },
              hasUnsavedChanges: true,
            };
          });
        },

        commitPendingChanges: (roomId) => {
          set((state) => {
            const pending = state.pendingChanges[roomId];
            if (!pending) return state;
            
            const currentSettings = state.roomSettings[roomId] || defaultSettings;
            const updatedSettings = { ...currentSettings, ...pending };
            
            const { [roomId]: removedPending, ...restPendingChanges } = state.pendingChanges;
            const hasOtherPendingChanges = Object.keys(restPendingChanges).length > 0;
            
            return {
              roomSettings: {
                ...state.roomSettings,
                [roomId]: updatedSettings,
              },
              pendingChanges: restPendingChanges,
              hasUnsavedChanges: hasOtherPendingChanges,
            };
          });
        },

        discardPendingChanges: (roomId) => {
          set((state) => {
            const { [roomId]: removedPending, ...restPendingChanges } = state.pendingChanges;
            const hasOtherPendingChanges = Object.keys(restPendingChanges).length > 0;
            
            return {
              pendingChanges: restPendingChanges,
              hasUnsavedChanges: hasOtherPendingChanges,
            };
          });
        },

        // Global preferences actions
        setPreferences: (preferences) => {
          set((state) => ({
            preferences: { ...state.preferences, ...preferences },
          }));
        },

        updatePreference: (key, value) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              [key]: value,
            },
          }));
        },

        resetPreferences: () => {
          set({ preferences: defaultPreferences });
        },

        // Loading states
        setSettingsLoading: (loading) => set({ settingsLoading: loading }),
        setSettingsError: (error) => set({ settingsError: error }),
        setPreferencesLoading: (loading) => set({ preferencesLoading: loading }),
        setPreferencesError: (error) => set({ preferencesError: error }),

        // Utilities
        getRoomSettings: (roomId) => get().roomSettings[roomId],
        
        getPendingChanges: (roomId) => get().pendingChanges[roomId] || {},
        
        hasRoomPendingChanges: (roomId) => {
          const pending = get().pendingChanges[roomId];
          return !!pending && Object.keys(pending).length > 0;
        },
        
        getDefaultSettings: () => defaultSettings,
      }),
      {
        name: 'meet-settings-store',
        // Only persist preferences, not room-specific settings
        partialize: (state) => ({
          preferences: state.preferences,
        }),
      }
    ),
    {
      name: 'meet-settings-store',
    }
  )
);