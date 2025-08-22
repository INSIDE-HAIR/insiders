/**
 * Implementación del servicio de Google Meet
 * Implementa IMeetService para operaciones con la API de Google Meet
 */

import {
  IMeetService,
  Room,
  RoomCreateRequest,
  RoomUpdateRequest,
  RoomMember,
  RoomListOptions,
  RoomListResponse,
} from "../interfaces/IMeetService";

export class GoogleMeetService implements IMeetService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = "/api/meet";
  }

  // Room CRUD operations
  async createRoom(request: RoomCreateRequest): Promise<Room> {
    const response = await fetch(`${this.baseUrl}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create room: ${response.status}`);
    }

    return response.json();
  }

  async getRoom(roomId: string): Promise<Room> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Room ${roomId} not found`);
      }
      const error = await response.json();
      throw new Error(error.message || `Failed to get room: ${response.status}`);
    }

    return response.json();
  }

  async listRooms(options: RoomListOptions = {}): Promise<RoomListResponse> {
    const params = new URLSearchParams();
    
    if (options.pageSize) params.set("pageSize", options.pageSize.toString());
    if (options.pageToken) params.set("pageToken", options.pageToken);
    if (options.search) params.set("search", options.search);
    if (options.accessType) params.set("accessType", options.accessType);
    if (options.status) params.set("status", options.status);
    if (options.createdBy) params.set("createdBy", options.createdBy);
    if (options.dateFrom) params.set("dateFrom", options.dateFrom.toISOString());
    if (options.dateTo) params.set("dateTo", options.dateTo.toISOString());
    if (options.sortBy) params.set("sortBy", options.sortBy);
    if (options.sortOrder) params.set("sortOrder", options.sortOrder);

    const response = await fetch(`${this.baseUrl}/rooms?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to list rooms: ${response.status}`);
    }

    return response.json();
  }

  async updateRoom(roomId: string, request: RoomUpdateRequest): Promise<Room> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update room: ${response.status}`);
    }

    return response.json();
  }

  async deleteRoom(roomId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete room: ${response.status}`);
    }
  }

  async duplicateRoom(roomId: string, newDisplayName?: string): Promise<Room> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/duplicate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayName: newDisplayName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to duplicate room: ${response.status}`);
    }

    return response.json();
  }

  // Room settings
  async getRoomSettings(roomId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/settings`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get room settings: ${response.status}`);
    }

    return response.json();
  }

  async updateRoomSettings(roomId: string, settings: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update room settings: ${response.status}`);
    }

    return response.json();
  }

  async resetRoomSettings(roomId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/settings/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to reset room settings: ${response.status}`);
    }

    return response.json();
  }

  // Members management
  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/members`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get room members: ${response.status}`);
    }

    const data = await response.json();
    return data.members || [];
  }

  async addRoomMember(roomId: string, email: string, role: "HOST" | "GUEST"): Promise<RoomMember> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to add room member: ${response.status}`);
    }

    return response.json();
  }

  async updateRoomMemberRole(roomId: string, memberId: string, role: "HOST" | "GUEST"): Promise<RoomMember> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/members/${memberId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update member role: ${response.status}`);
    }

    return response.json();
  }

  async removeRoomMember(roomId: string, memberId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/members/${memberId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to remove room member: ${response.status}`);
    }
  }

  async bulkAddMembers(roomId: string, members: Array<{ email: string; role: "HOST" | "GUEST" }>): Promise<RoomMember[]> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/members/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ members }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to add members: ${response.status}`);
    }

    const data = await response.json();
    return data.members || [];
  }

  // Conference management
  async getActiveConference(roomId: string): Promise<any | null> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/conference`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No active conference
      }
      const error = await response.json();
      throw new Error(error.message || `Failed to get active conference: ${response.status}`);
    }

    return response.json();
  }

  async endActiveConference(roomId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/conference/end`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to end conference: ${response.status}`);
    }
  }

  // Bulk operations
  async bulkDeleteRooms(roomIds: string[]): Promise<{ successful: string[]; failed: Array<{ roomId: string; error: string }> }> {
    const response = await fetch(`${this.baseUrl}/rooms/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to bulk delete rooms: ${response.status}`);
    }

    return response.json();
  }

  async bulkUpdateAccessType(roomIds: string[], accessType: "OPEN" | "TRUSTED" | "RESTRICTED"): Promise<{ successful: string[]; failed: Array<{ roomId: string; error: string }> }> {
    const response = await fetch(`${this.baseUrl}/rooms/bulk-update-access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomIds, accessType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to bulk update access type: ${response.status}`);
    }

    return response.json();
  }

  async bulkUpdateSettings(roomIds: string[], settings: any): Promise<{ successful: string[]; failed: Array<{ roomId: string; error: string }> }> {
    const response = await fetch(`${this.baseUrl}/rooms/bulk-update-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomIds, settings }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to bulk update settings: ${response.status}`);
    }

    return response.json();
  }

  // Validation and utilities
  async validateRoomName(name: string): Promise<{ valid: boolean; suggestions?: string[] }> {
    const response = await fetch(`${this.baseUrl}/rooms/validate-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to validate room name: ${response.status}`);
    }

    return response.json();
  }

  async generateMeetingCode(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/rooms/generate-code`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to generate meeting code: ${response.status}`);
    }

    const data = await response.json();
    return data.code;
  }

  async checkRoomExists(identifier: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/rooms/exists?identifier=${encodeURIComponent(identifier)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to check room existence: ${response.status}`);
    }

    const data = await response.json();
    return data.exists;
  }
}