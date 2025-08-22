/**
 * Interface para servicios de Google Meet
 * Define contratos para operaciones de salas, configuraciones y gestión
 */

export interface RoomCreateRequest {
  displayName: string;
  config?: {
    accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
    entryPointAccess?: "ALL" | "CREATOR_APP_ONLY";
  };
  settings?: {
    moderation?: boolean;
    recording?: boolean;
    transcription?: boolean;
    smartNotes?: boolean;
    attendanceReport?: boolean;
  };
  members?: Array<{
    email: string;
    role: "HOST" | "GUEST";
  }>;
}

export interface RoomUpdateRequest {
  displayName?: string;
  config?: {
    accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
    entryPointAccess?: "ALL" | "CREATOR_APP_ONLY";
  };
  settings?: Partial<{
    moderationSettings: { moderationEnabled: boolean };
    recordingSettings: { autoRecordingGeneration: "ON" | "OFF" };
    transcriptionSettings: { autoTranscriptionGeneration: "ON" | "OFF" };
    smartNotesSettings: { autoSmartNotesGeneration: "ON" | "OFF" };
    attendanceReportGenerationType: "GENERATE_REPORT" | "DO_NOT_GENERATE";
  }>;
}

export interface Room {
  id: string;
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
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface RoomMember {
  id: string;
  email: string;
  role: "HOST" | "GUEST";
  displayName?: string;
  joinedAt?: Date;
  status: "ACTIVE" | "PENDING" | "REMOVED";
}

export interface RoomListOptions {
  pageSize?: number;
  pageToken?: string;
  search?: string;
  accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
  status?: "active" | "inactive";
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "name" | "created" | "lastUsed";
  sortOrder?: "asc" | "desc";
}

export interface RoomListResponse {
  rooms: Room[];
  nextPageToken?: string;
  totalCount?: number;
  stats?: {
    total: number;
    active: number;
    byAccessType: Record<string, number>;
  };
}

/**
 * Interface principal para servicios de Meet
 */
export interface IMeetService {
  // Room CRUD operations
  createRoom(request: RoomCreateRequest): Promise<Room>;
  getRoom(roomId: string): Promise<Room>;
  listRooms(options?: RoomListOptions): Promise<RoomListResponse>;
  updateRoom(roomId: string, request: RoomUpdateRequest): Promise<Room>;
  deleteRoom(roomId: string): Promise<void>;
  duplicateRoom(roomId: string, newDisplayName?: string): Promise<Room>;

  // Room settings
  getRoomSettings(roomId: string): Promise<any>;
  updateRoomSettings(roomId: string, settings: any): Promise<any>;
  resetRoomSettings(roomId: string): Promise<any>;

  // Members management
  getRoomMembers(roomId: string): Promise<RoomMember[]>;
  addRoomMember(roomId: string, email: string, role: "HOST" | "GUEST"): Promise<RoomMember>;
  updateRoomMemberRole(roomId: string, memberId: string, role: "HOST" | "GUEST"): Promise<RoomMember>;
  removeRoomMember(roomId: string, memberId: string): Promise<void>;
  bulkAddMembers(roomId: string, members: Array<{ email: string; role: "HOST" | "GUEST" }>): Promise<RoomMember[]>;

  // Conference management
  getActiveConference(roomId: string): Promise<any | null>;
  endActiveConference(roomId: string): Promise<void>;

  // Bulk operations
  bulkDeleteRooms(roomIds: string[]): Promise<{ successful: string[]; failed: Array<{ roomId: string; error: string }> }>;
  bulkUpdateAccessType(roomIds: string[], accessType: "OPEN" | "TRUSTED" | "RESTRICTED"): Promise<{ successful: string[]; failed: Array<{ roomId: string; error: string }> }>;
  bulkUpdateSettings(roomIds: string[], settings: any): Promise<{ successful: string[]; failed: Array<{ roomId: string; error: string }> }>;

  // Validation and utilities
  validateRoomName(name: string): Promise<{ valid: boolean; suggestions?: string[] }>;
  generateMeetingCode(): Promise<string>;
  checkRoomExists(identifier: string): Promise<boolean>;
}