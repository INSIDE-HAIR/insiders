// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/src/config/auth/auth';
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Users API route started');
    
    // Test authentication
    const session = await auth();
    console.log('📋 Session check:', session ? 'Found' : 'Not found');
    
    if (!session?.user) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      console.log('❌ Insufficient privileges:', session.user.role);
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      );
    }

    console.log(`✅ Admin ${session.user.email} accessing users list`);
    
    const users = await prisma.user.findMany({
      include: {
        clientsFields: true,
        salesFields: true,
        consultingAndMentoringFields: true,
        marketingFields: true,
        trainingsFields: true,
        holdedData: {
          include: {
            customFields: true,
          },
        },
      },
    });

    console.log(`📊 Retrieved ${users.length} users for admin ${session.user.email}`);
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("❌ Users API error:", error);
    return NextResponse.json(
      { 
        error: "Error fetching users from database",
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      },
      { status: 500 }
    );
  }
}
