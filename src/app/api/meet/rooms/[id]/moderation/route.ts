import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetSpaceConfigService } from "@/src/features/meet/services/MeetSpaceConfigService";

/**
 * PATCH /api/meet/rooms/[id]/moderation
 * Update moderation settings for a specific room
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verify admin permissions
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id: spaceId } = await params;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Parse request body
    const moderationSettings = await request.json();

    // Initialize services
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const spaceConfigService = new MeetSpaceConfigService(calendarService.auth);

    // Get current space configuration
    const currentSpace = await spaceConfigService.getSpace(spaceId);
    

    // Get token for direct API calls
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      throw new Error("No access token available");
    }

    // Make individual API calls for each setting to avoid update mask conflicts
    let updatedSpace = currentSpace;
    const updates: any[] = [];

    // Handle entry point access
    if (moderationSettings.entryPointRestriction !== undefined) {
      const entryPointConfig = {
        name: `spaces/${spaceId}`,
        config: {
          entryPointAccess: moderationSettings.entryPointRestriction ? "CREATOR_APP_ONLY" : "ALL"
        }
      };
      updates.push({
        config: entryPointConfig,
        mask: "config.entryPointAccess"
      });
    }

    // Handle moderation toggle
    if (moderationSettings.moderation !== undefined) {
      const moderationConfig = {
        name: `spaces/${spaceId}`,
        config: {
          moderation: moderationSettings.moderation ? "ON" : "OFF"
        }
      };
      updates.push({
        config: moderationConfig,
        mask: "config.moderation"
      });
    }

    // Handle chat restriction
    if (moderationSettings.chatRestriction !== undefined) {
      const chatConfig = {
        name: `spaces/${spaceId}`,
        config: {
          moderationRestrictions: {
            chatRestriction: moderationSettings.chatRestriction
          }
        }
      };
      updates.push({
        config: chatConfig,
        mask: "config.moderationRestrictions.chatRestriction"
      });
    }

    // Handle present restriction
    if (moderationSettings.presentRestriction !== undefined) {
      const presentConfig = {
        name: `spaces/${spaceId}`,
        config: {
          moderationRestrictions: {
            presentRestriction: moderationSettings.presentRestriction
          }
        }
      };
      updates.push({
        config: presentConfig,
        mask: "config.moderationRestrictions.presentRestriction"
      });
    }

    // Handle default join as viewer (maps to defaultJoinAsViewerType)
    if (moderationSettings.defaultJoinAsViewer !== undefined) {
      const viewerConfig = {
        name: `spaces/${spaceId}`,
        config: {
          moderationRestrictions: {
            defaultJoinAsViewerType: moderationSettings.defaultJoinAsViewer ? "ON" : "OFF"
          }
        }
      };
      updates.push({
        config: viewerConfig,
        mask: "config.moderationRestrictions.defaultJoinAsViewerType"
      });
    }

    // Execute all updates sequentially
    for (const update of updates) {
      console.log(`🔧 Updating ${update.mask} for space ${spaceId}`);
      
      const updateResponse = await fetch(
        `https://meet.googleapis.com/v2beta/spaces/${spaceId}?updateMask=${encodeURIComponent(update.mask)}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(update.config)
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`Failed to update ${update.mask}: ${updateResponse.status}`, errorText);
        throw new Error(`Failed to update ${update.mask}: ${updateResponse.status} - ${errorText}`);
      }

      updatedSpace = await updateResponse.json();
      console.log(`✅ Updated ${update.mask} successfully`);
    }

    console.log(`✅ Updated moderation settings for space ${spaceId}`);

    return NextResponse.json({
      success: true,
      spaceId,
      updatedSettings: moderationSettings,
      space: updatedSpace,
    });
  } catch (error: any) {
    console.error("Failed to update moderation settings:", error);

    return NextResponse.json(
      {
        error: "Error updating moderation settings",
        details: error.message,
      },
      { status: 500 }
    );
  }
}