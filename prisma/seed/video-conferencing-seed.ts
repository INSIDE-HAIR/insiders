/**
 * Video Conferencing Seed Data
 * Creates sample data for video conferencing features
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedVideoConferencing() {
  console.log("🎥 Seeding video conferencing data...");

  try {
    // First, find or create a user to own the video spaces
    let user = await prisma.user.findFirst({
      where: { email: "admin@example.com" },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User",
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });
    }

    // Create integration accounts
    const integrationAccounts = await Promise.all([
      prisma.integrationAccount.upsert({
        where: {
          provider_accountEmail: {
            provider: "MEET",
            accountEmail: "admin@company.com",
          },
        },
        update: {},
        create: {
          provider: "MEET",
          accountName: "Google Workspace Account",
          accountEmail: "admin@company.com",
          accessToken: "encrypted_google_token",
          refreshToken: "encrypted_google_refresh",
          tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          scopes: ["https://www.googleapis.com/auth/meetings"],
          status: "ACTIVE",
          userId: user.id,
        },
      }),
      prisma.integrationAccount.upsert({
        where: {
          provider_accountEmail: {
            provider: "ZOOM",
            accountEmail: "zoom@company.com",
          },
        },
        update: {},
        create: {
          provider: "ZOOM",
          accountName: "Zoom Pro Account",
          accountEmail: "zoom@company.com",
          accessToken: "encrypted_zoom_token",
          refreshToken: "encrypted_zoom_refresh",
          tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          scopes: ["meeting:write", "meeting:read"],
          status: "ACTIVE",
          userId: user.id,
        },
      }),
      prisma.integrationAccount.upsert({
        where: {
          provider_accountEmail: {
            provider: "VIMEO",
            accountEmail: "vimeo@company.com",
          },
        },
        update: {},
        create: {
          provider: "VIMEO",
          accountName: "Vimeo Business",
          accountEmail: "vimeo@company.com",
          accessToken: "encrypted_vimeo_token",
          scopes: ["create", "edit", "delete"],
          status: "ERROR", // Simulate an error state
          userId: user.id,
        },
      }),
    ]);

    console.log(
      `✅ Created ${integrationAccounts.length} integration accounts`
    );

    // Create sample video spaces
    const videoSpaces = await Promise.all([
      prisma.videoSpace.upsert({
        where: { id: "space-1" },
        update: {},
        create: {
          id: "space-1",
          name: "Master IBM - Sesión 1",
          description:
            "Primera sesión del Master en Inside Business Management",
          provider: "MEET",
          status: "ACTIVE",
          providerRoomId: "meet_12345",
          providerJoinUri: "https://meet.google.com/abc-defg-hij",
          ownerId: user.id,
          integrationAccountId: integrationAccounts[0].id,
          settings: {
            maxParticipants: 100,
            requiresAuth: false,
            recordingEnabled: true,
            chatEnabled: true,
            screenShareEnabled: true,
            waitingRoomEnabled: false,
          },
          cohort: "master-ibm-2024",
          tags: ["master", "ibm", "business"],
        },
      }),
      prisma.videoSpace.upsert({
        where: { id: "space-2" },
        update: {},
        create: {
          id: "space-2",
          name: "Consultoría Estratégica",
          description: "Sesión de consultoría para plan estratégico",
          provider: "ZOOM",
          status: "ACTIVE",
          providerRoomId: "zoom_67890",
          providerJoinUri: "https://zoom.us/j/123456789",
          ownerId: user.id,
          integrationAccountId: integrationAccounts[1].id,
          settings: {
            maxParticipants: 50,
            requiresAuth: false,
            recordingEnabled: false,
            chatEnabled: true,
            screenShareEnabled: true,
            waitingRoomEnabled: true,
          },
          cohort: "consultoria-2024",
          tags: ["consultoria", "estrategia"],
        },
      }),
      prisma.videoSpace.upsert({
        where: { id: "space-3" },
        update: {},
        create: {
          id: "space-3",
          name: "Formación Creativa",
          description: "Taller de creatividad para el equipo",
          provider: "VIMEO",
          status: "INACTIVE",
          providerRoomId: "vimeo_11111",
          providerJoinUri: "https://vimeo.com/event/123456",
          ownerId: user.id,
          integrationAccountId: integrationAccounts[2].id,
          settings: {
            maxParticipants: 30,
            requiresAuth: true,
            recordingEnabled: true,
            chatEnabled: false,
            screenShareEnabled: true,
            waitingRoomEnabled: false,
          },
          cohort: "formacion-2024",
          tags: ["formacion", "creatividad", "equipo"],
        },
      }),
    ]);

    console.log(`✅ Created ${videoSpaces.length} video spaces`);

    // Create some sample meeting records
    const meetingRecords = await Promise.all([
      prisma.meetingRecord.create({
        data: {
          videoSpaceId: videoSpaces[0].id,
          providerMeetingId: "meet_session_001",
          title: "Master IBM - Sesión 1 - Grabación",
          startTime: new Date("2024-01-15T10:00:00Z"),
          endTime: new Date("2024-01-15T12:15:00Z"),
          duration: 135,
          status: "ENDED",
          totalParticipants: 25,
          maxConcurrentUsers: 23,
        },
      }),
      prisma.meetingRecord.create({
        data: {
          videoSpaceId: videoSpaces[1].id,
          providerMeetingId: "zoom_session_001",
          title: "Consultoría Estratégica - Reunión 1",
          startTime: new Date("2024-01-16T14:00:00Z"),
          endTime: new Date("2024-01-16T15:30:00Z"),
          duration: 90,
          status: "ENDED",
          totalParticipants: 12,
          maxConcurrentUsers: 12,
        },
      }),
    ]);

    console.log(`✅ Created ${meetingRecords.length} meeting records`);

    // Create some link aliases
    const aliases = await Promise.all([
      prisma.linkAlias.create({
        data: {
          alias: "master-ibm",
          videoSpaceId: videoSpaces[0].id,
          accessCount: 15,
          lastAccessedAt: new Date("2024-01-15T09:45:00Z"),
        },
      }),
      prisma.linkAlias.create({
        data: {
          alias: "consultoria-estrategica",
          videoSpaceId: videoSpaces[1].id,
          accessCount: 8,
          lastAccessedAt: new Date("2024-01-16T13:55:00Z"),
        },
      }),
    ]);

    console.log(`✅ Created ${aliases.length} link aliases`);

    console.log("🎉 Video conferencing seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding video conferencing data:", error);
    throw error;
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedVideoConferencing()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
