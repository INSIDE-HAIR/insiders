/**
 * Video Conferencing Seed Data
 * Creates sample data for video conferencing features
 */
require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedVideoConferencing() {
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

    console.log(`✅ Using user: ${user.email}`);

    // Create integration accounts
    const integrationAccounts = [];

    try {
      const meetAccount = await prisma.integrationAccount.upsert({
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
      });
      integrationAccounts.push(meetAccount);
    } catch (error) {
      console.log("Meet account already exists or error:", error.message);
    }

    try {
      const zoomAccount = await prisma.integrationAccount.upsert({
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
      });
      integrationAccounts.push(zoomAccount);
    } catch (error) {
      console.log("Zoom account already exists or error:", error.message);
    }

    try {
      const vimeoAccount = await prisma.integrationAccount.upsert({
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
      });
      integrationAccounts.push(vimeoAccount);
    } catch (error) {
      console.log("Vimeo account already exists or error:", error.message);
    }

    console.log(`✅ Integration accounts ready: ${integrationAccounts.length}`);

    // Get existing integration accounts if creation failed
    if (integrationAccounts.length === 0) {
      const existingAccounts = await prisma.integrationAccount.findMany({
        where: { userId: user.id },
      });
      integrationAccounts.push(...existingAccounts);
    }

    if (integrationAccounts.length === 0) {
      throw new Error("No integration accounts available");
    }

    // Create sample video spaces
    const videoSpaces = [];

    try {
      // Check if space already exists by name
      const existingSpace1 = await prisma.videoSpace.findFirst({
        where: {
          name: "Master IBM - Sesión 1",
          ownerId: user.id,
        },
      });

      if (!existingSpace1) {
        const space1 = await prisma.videoSpace.create({
          data: {
            name: "Master IBM - Sesión 1",
            description:
              "Primera sesión del Master en Inside Business Management",
            provider: "MEET",
            status: "ACTIVE",
            providerRoomId: "meet_12345",
            providerJoinUri: "https://meet.google.com/abc-defg-hij",
            ownerId: user.id,
            integrationAccountId: integrationAccounts[0].id,
            maxParticipants: 100,
            requiresAuth: false,
            recordingEnabled: true,
            chatEnabled: true,
            screenShareEnabled: true,
            waitingRoomEnabled: false,
            cohort: "master-ibm-2024",
            tags: ["master", "ibm", "business"],
          },
        });
        videoSpaces.push(space1);
      } else {
        videoSpaces.push(existingSpace1);
      }
    } catch (error) {
      console.log("Space 1 error:", error.message);
    }

    try {
      // Check if space already exists by name
      const existingSpace2 = await prisma.videoSpace.findFirst({
        where: {
          name: "Consultoría Estratégica",
          ownerId: user.id,
        },
      });

      if (!existingSpace2) {
        const space2 = await prisma.videoSpace.create({
          data: {
            name: "Consultoría Estratégica",
            description: "Sesión de consultoría para plan estratégico",
            provider: "ZOOM",
            status: "ACTIVE",
            providerRoomId: "zoom_67890",
            providerJoinUri: "https://zoom.us/j/123456789",
            ownerId: user.id,
            integrationAccountId:
              integrationAccounts[Math.min(1, integrationAccounts.length - 1)]
                .id,
            maxParticipants: 50,
            requiresAuth: false,
            recordingEnabled: false,
            chatEnabled: true,
            screenShareEnabled: true,
            waitingRoomEnabled: true,
            cohort: "consultoria-2024",
            tags: ["consultoria", "estrategia"],
          },
        });
        videoSpaces.push(space2);
      } else {
        videoSpaces.push(existingSpace2);
      }
    } catch (error) {
      console.log("Space 2 error:", error.message);
    }

    try {
      // Check if space already exists by name
      const existingSpace3 = await prisma.videoSpace.findFirst({
        where: {
          name: "Formación Creativa",
          ownerId: user.id,
        },
      });

      if (!existingSpace3) {
        const space3 = await prisma.videoSpace.create({
          data: {
            name: "Formación Creativa",
            description: "Taller de creatividad para el equipo",
            provider: "VIMEO",
            status: "INACTIVE",
            providerRoomId: "vimeo_11111",
            providerJoinUri: "https://vimeo.com/event/123456",
            ownerId: user.id,
            integrationAccountId:
              integrationAccounts[Math.min(2, integrationAccounts.length - 1)]
                .id,
            maxParticipants: 30,
            requiresAuth: true,
            recordingEnabled: true,
            chatEnabled: false,
            screenShareEnabled: true,
            waitingRoomEnabled: false,
            cohort: "formacion-2024",
            tags: ["formacion", "creatividad", "equipo"],
          },
        });
        videoSpaces.push(space3);
      } else {
        videoSpaces.push(existingSpace3);
      }
    } catch (error) {
      console.log("Space 3 error:", error.message);
    }

    console.log(`✅ Created ${videoSpaces.length} video spaces`);

    console.log("🎉 Video conferencing seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding video conferencing data:", error);
    throw error;
  }
}

// Run the seed
seedVideoConferencing()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
