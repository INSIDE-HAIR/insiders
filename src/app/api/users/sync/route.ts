import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { updateUserHoldedData } from "@/src/lib/server-actions/auth/user/settings/user-holded-data-update";

const prisma = new PrismaClient();
const HOLDED_API_BASE_URL = "https://api.holded.com/api/invoicing/v1/contacts";

export async function POST(request: NextRequest) {
  try {
    // Get all existing users with holdedId
    const existingUsers = await prisma.user.findMany({
      where: {
        holdedId: {
          not: null,
        },
      },
      select: { id: true, email: true, holdedId: true },
    });

    let updatedUsersCount = 0;
    let errorUsersCount = 0;
    const updateResults = {
      updated: [] as string[],
      failed: [] as { userId: string; error: string }[],
    };

    // Iterate over existing users and fetch their Holded data
    for (const user of existingUsers) {
      if (user.holdedId) {
        try {
          const holdedResponse = await fetch(
            `${HOLDED_API_BASE_URL}/${user.holdedId}`,
            {
              method: "GET",
              headers: {
                accept: "application/json",
                key: process.env.HOLDED_API_KEY as string,
              },
              next: { revalidate: 0 },
            }
          );

          if (!holdedResponse.ok) {
            throw new Error(
              `Error fetching contact: ${holdedResponse.statusText}`
            );
          }

          const holdedContact = await holdedResponse.json();

          console.log(
            `Attempting to update user ${user.id} with holdedId ${user.holdedId}`
          );

          const result = await updateUserHoldedData(user.id, user.holdedId);
          if (result.success) {
            updateResults.updated.push(user.id);
            updatedUsersCount++;
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error(
            `Error processing user ${user.id} with holdedId ${user.holdedId}:`,
            error
          );
          updateResults.failed.push({
            userId: user.id,
            error: error instanceof Error ? error.message : String(error),
          });
          errorUsersCount++;
        }
      } else {
        console.log(`User ${user.id} has no holdedId`);
      }
    }

    console.log("Successfully updated users:", updateResults.updated);
    console.log("Failed updates:", updateResults.failed);
    console.log(`Total updated users: ${updatedUsersCount}`);
    console.log(`Total users with errors: ${errorUsersCount}`);

    return NextResponse.json(
      {
        message: "Sync completed",
        updatedUsersCount,
        errorUsersCount,
        updateResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing users with Holded:", error);
    return NextResponse.json(
      { error: "Error syncing users with Holded" },
      { status: 500 }
    );
  }
}
