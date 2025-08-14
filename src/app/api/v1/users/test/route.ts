import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing users API route...");

    // Test authentication first
    const session = await auth();
    console.log("📋 Session:", session);

    if (!session?.user) {
      console.log("❌ No session found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      console.log("❌ Insufficient privileges:", session.user.role);
      return NextResponse.json(
        { error: "Admin role required" },
        { status: 403 }
      );
    }

    console.log("✅ Authentication successful for:", session.user.email);

    // Test database connection
    console.log("🔍 Testing database connection...");
    const userCount = await prisma.user.count();
    console.log("📊 Total users in database:", userCount);

    // Get first few users for testing
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("✅ Users fetched successfully:", users.length);

    return NextResponse.json(
      {
        success: true,
        message: "Test API route working",
        user: session.user.email,
        userRole: session.user.role,
        totalUsers: userCount,
        sampleUsers: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Test API route error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 }
    );
  }
}
