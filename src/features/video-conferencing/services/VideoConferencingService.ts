/**
 * Video Conferencing Service
 * Main orchestrator service for video conferencing operations
 */
import { PrismaClient } from "@prisma/client";
import { GoogleMeetService } from "./GoogleMeetService";
import { ZoomService } from "./ZoomService";
import { VimeoService } from "./VimeoService";
import {
  VideoSpace,
  VideoProvider,
  VideoSpaceStatus,
  VideoSpacesResponse,
  VideoSpaceFormData,
} from "../types/video-conferencing";

export class VideoConferencingService {
  constructor(
    private prisma: PrismaClient,
    private googleMeetService: GoogleMeetService,
    private zoomService: ZoomService,
    private vimeoService: VimeoService
  ) {}

  /**
   * List video spaces with filtering and pagination
   */
  async listVideoSpaces(options: {
    page?: number;
    limit?: number;
    provider?: VideoProvider;
    status?: VideoSpaceStatus;
    search?: string;
    userId?: string;
  }): Promise<VideoSpacesResponse> {
    const { page = 1, limit = 20, provider, status, search, userId } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (provider) {
      where.provider = provider;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute queries
    const [videoSpaces, total] = await Promise.all([
      this.prisma.videoSpace.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              meetingRecords: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.videoSpace.count({ where }),
    ]);

    return {
      videoSpaces: videoSpaces as VideoSpace[],
      total,
      page,
      limit,
      hasMore: skip + videoSpaces.length < total,
    };
  }

  /**
   * Get a single video space by ID
   */
  async getVideoSpace(id: string): Promise<VideoSpace | null> {
    const videoSpace = await this.prisma.videoSpace.findUnique({
      where: { id },
      include: {
        integrationAccount: true,
        _count: {
          select: {
            meetingRecords: true,
          },
        },
      },
    });

    return videoSpace as VideoSpace | null;
  }

  /**
   * Create a new video space
   */
  async createVideoSpace(
    data: {
      title: string;
      description?: string;
      provider: VideoProvider;
      scheduledStartTime: Date;
      scheduledEndTime: Date;
      maxParticipants?: number;
      settings?: Record<string, any>;
    },
    userId: string
  ): Promise<VideoSpace> {
    // Get the appropriate service based on provider
    const providerService = this.getProviderService(data.provider);

    // Create space with the provider
    const providerResponse = await this.createProviderSpace(
      data.provider,
      data
    );

    // Create in database
    const videoSpace = await this.prisma.videoSpace.create({
      data: {
        title: data.title,
        description: data.description,
        provider: data.provider,
        status: "SCHEDULED",
        providerSpaceId: providerResponse.providerSpaceId,
        joinUrl: providerResponse.joinUrl,
        hostUrl: providerResponse.hostUrl,
        maxParticipants: data.maxParticipants,
        requiresAuth: data.settings?.requiresAuth || false,
        recordingEnabled: data.settings?.recordingEnabled || false,
        chatEnabled: data.settings?.chatEnabled || true,
        screenShareEnabled: data.settings?.screenShareEnabled || true,
        waitingRoomEnabled: data.settings?.waitingRoomEnabled || false,
        integrationAccountId: "default", // This should come from the request
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            meetingRecords: true,
          },
        },
      },
    });

    return videoSpace as VideoSpace;
  }

  /**
   * Update a video space
   */
  async updateVideoSpace(
    id: string,
    data: {
      title?: string;
      description?: string;
      maxParticipants?: number;
      settings?: Record<string, any>;
    }
  ): Promise<VideoSpace> {
    const videoSpace = await this.prisma.videoSpace.findUnique({
      where: { id },
    });

    if (!videoSpace) {
      throw new Error("Video space not found");
    }

    // Update with provider if needed
    if (data.title || data.settings) {
      await this.updateProviderSpace(
        videoSpace.provider as VideoProvider,
        videoSpace.providerSpaceId,
        data
      );
    }

    // Update in database
    const updatedVideoSpace = await this.prisma.videoSpace.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        maxParticipants: data.maxParticipants,
        requiresAuth: data.settings?.requiresAuth,
        recordingEnabled: data.settings?.recordingEnabled,
        chatEnabled: data.settings?.chatEnabled,
        screenShareEnabled: data.settings?.screenShareEnabled,
        waitingRoomEnabled: data.settings?.waitingRoomEnabled,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            meetingRecords: true,
          },
        },
      },
    });

    return updatedVideoSpace as VideoSpace;
  }

  /**
   * Delete a video space
   */
  async deleteVideoSpace(id: string): Promise<void> {
    const videoSpace = await this.prisma.videoSpace.findUnique({
      where: { id },
    });

    if (!videoSpace) {
      throw new Error("Video space not found");
    }

    // Delete from provider
    await this.deleteProviderSpace(
      videoSpace.provider as VideoProvider,
      videoSpace.providerSpaceId
    );

    // Delete from database
    await this.prisma.videoSpace.delete({
      where: { id },
    });
  }

  /**
   * Get provider service instance
   */
  private getProviderService(provider: VideoProvider) {
    switch (provider) {
      case "GOOGLE_MEET":
        return this.googleMeetService;
      case "ZOOM":
        return this.zoomService;
      case "VIMEO":
        return this.vimeoService;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Create space with provider
   */
  private async createProviderSpace(
    provider: VideoProvider,
    data: any
  ): Promise<{
    providerSpaceId: string;
    joinUrl: string;
    hostUrl?: string;
  }> {
    switch (provider) {
      case "GOOGLE_MEET":
        return this.googleMeetService.createSpace(data);
      case "ZOOM":
        return this.zoomService.createMeeting(data);
      case "VIMEO":
        return this.vimeoService.createLiveEvent(data);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Update space with provider
   */
  private async updateProviderSpace(
    provider: VideoProvider,
    providerSpaceId: string,
    data: any
  ): Promise<void> {
    switch (provider) {
      case "GOOGLE_MEET":
        return this.googleMeetService.updateSpace(providerSpaceId, data);
      case "ZOOM":
        return this.zoomService.updateMeeting(providerSpaceId, data);
      case "VIMEO":
        return this.vimeoService.updateLiveEvent(providerSpaceId, data);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Delete space from provider
   */
  private async deleteProviderSpace(
    provider: VideoProvider,
    providerSpaceId: string
  ): Promise<void> {
    switch (provider) {
      case "GOOGLE_MEET":
        return this.googleMeetService.deleteSpace(providerSpaceId);
      case "ZOOM":
        return this.zoomService.deleteMeeting(providerSpaceId);
      case "VIMEO":
        return this.vimeoService.deleteLiveEvent(providerSpaceId);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
