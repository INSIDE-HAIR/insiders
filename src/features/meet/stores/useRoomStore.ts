import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Room {
  name: string;
  displayName?: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: {
    accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
    entryPointAccess?: "ALL" | "CREATOR_APP_ONLY";
  };
  activeConference?: {
    conferenceRecord?: string;
  };
  _metadata?: {
    localId?: string;
    displayName?: string;
    createdAt?: Date;
    createdBy?: string;
    lastSyncAt?: Date;
    source?: string;
    organizationId?: string;
    organizationName?: string;
    domain?: string;
    createdByEmail?: string;
  };
  membershipSettings?: {
    maxParticipants?: number;
    allowAnonymous?: boolean;
    requireApproval?: boolean;
  };
  integrations?: {
    calendar?: boolean;
    drive?: boolean;
    chat?: boolean;
  };
  analytics?: {
    totalMeetings?: number;
    totalHours?: number;
    avgParticipants?: number;
    lastUsed?: Date;
  };
}

export interface RoomMember {
  id: string;
  email: string;
  role: "HOST" | "GUEST";
  displayName?: string;
  avatar?: string;
  addedAt: Date;
  status: "ACTIVE" | "PENDING" | "REMOVED";
}

interface RoomState {
  // Current room data
  currentRoom: Room | null;
  currentRoomId: string | null;
  
  // Room list and caching
  rooms: Record<string, Room>;
  roomsLoading: boolean;
  roomsError: string | null;
  
  // Members
  members: Record<string, RoomMember[]>; // key: roomId
  membersLoading: boolean;
  membersError: string | null;
  
  // UI State
  selectedTab: "general" | "members" | "organization" | "activity";
  isModalOpen: boolean;
  
  // Actions
  setCurrentRoom: (room: Room | null, roomId?: string) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  
  // Members actions
  setMembers: (roomId: string, members: RoomMember[]) => void;
  addMember: (roomId: string, member: RoomMember) => void;
  removeMember: (roomId: string, memberId: string) => void;
  updateMember: (roomId: string, memberId: string, updates: Partial<RoomMember>) => void;
  
  // UI actions
  setSelectedTab: (tab: RoomState["selectedTab"]) => void;
  setModalOpen: (open: boolean) => void;
  
  // Loading states
  setRoomsLoading: (loading: boolean) => void;
  setRoomsError: (error: string | null) => void;
  setMembersLoading: (loading: boolean) => void;
  setMembersError: (error: string | null) => void;
  
  // Utilities
  getRoomById: (roomId: string) => Room | undefined;
  getMembersByRoom: (roomId: string) => RoomMember[];
  clearRoomData: () => void;
}

export const useRoomStore = create<RoomState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentRoom: null,
      currentRoomId: null,
      rooms: {},
      roomsLoading: false,
      roomsError: null,
      members: {},
      membersLoading: false,
      membersError: null,
      selectedTab: "general",
      isModalOpen: false,

      // Room actions
      setCurrentRoom: (room, roomId) => {
        set({
          currentRoom: room,
          currentRoomId: roomId || null,
        });
        
        // Cache the room if provided
        if (room && roomId) {
          set((state) => ({
            rooms: {
              ...state.rooms,
              [roomId]: room,
            },
          }));
        }
      },

      updateRoom: (roomId, updates) => {
        set((state) => {
          const existingRoom = state.rooms[roomId];
          if (!existingRoom) return state;
          
          const updatedRoom = { ...existingRoom, ...updates };
          
          return {
            rooms: {
              ...state.rooms,
              [roomId]: updatedRoom,
            },
            // Update current room if it's the same
            currentRoom: state.currentRoomId === roomId ? updatedRoom : state.currentRoom,
          };
        });
      },

      addRoom: (room) => {
        // Ensure room has a name
        const roomWithName = {
          ...room,
          name: room.name || `room_${Date.now()}`,
        };
        const roomId = roomWithName.name;
        set((state) => ({
          rooms: {
            ...state.rooms,
            [roomId]: roomWithName,
          },
        }));
      },

      removeRoom: (roomId) => {
        set((state) => {
          const { [roomId]: removed, ...restRooms } = state.rooms;
          const { [roomId]: removedMembers, ...restMembers } = state.members;
          
          return {
            rooms: restRooms,
            members: restMembers,
            // Clear current room if it's the one being removed
            currentRoom: state.currentRoomId === roomId ? null : state.currentRoom,
            currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
          };
        });
      },

      // Members actions
      setMembers: (roomId, members) => {
        set((state) => ({
          members: {
            ...state.members,
            [roomId]: members,
          },
        }));
      },

      addMember: (roomId, member) => {
        set((state) => ({
          members: {
            ...state.members,
            [roomId]: [...(state.members[roomId] || []), member],
          },
        }));
      },

      removeMember: (roomId, memberId) => {
        set((state) => ({
          members: {
            ...state.members,
            [roomId]: (state.members[roomId] || []).filter(m => m.id !== memberId),
          },
        }));
      },

      updateMember: (roomId, memberId, updates) => {
        set((state) => ({
          members: {
            ...state.members,
            [roomId]: (state.members[roomId] || []).map(member =>
              member.id === memberId ? { ...member, ...updates } : member
            ),
          },
        }));
      },

      // UI actions
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      setModalOpen: (open) => set({ isModalOpen: open }),

      // Loading states
      setRoomsLoading: (loading) => set({ roomsLoading: loading }),
      setRoomsError: (error) => set({ roomsError: error }),
      setMembersLoading: (loading) => set({ membersLoading: loading }),
      setMembersError: (error) => set({ membersError: error }),

      // Utilities
      getRoomById: (roomId) => get().rooms[roomId],
      
      getMembersByRoom: (roomId) => get().members[roomId] || [],
      
      clearRoomData: () => {
        set({
          currentRoom: null,
          currentRoomId: null,
          rooms: {},
          members: {},
          roomsError: null,
          membersError: null,
          selectedTab: "general",
          isModalOpen: false,
        });
      },
    }),
    {
      name: 'meet-room-store',
    }
  )
);