// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        holdedData: {
          include: {
            customFields: true,
          },
        },
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error fetching users from database" },
      { status: 500 }
    );
  }
}
