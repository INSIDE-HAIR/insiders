import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/src/config/auth/auth';
import prisma from "@/prisma/database";

// GET - Get available users for group assignment
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const excludeGroupId = searchParams.get('excludeGroup');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    
    const where: any = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ];
    }
    
    // Role filter
    if (role && ['CLIENT', 'EMPLOYEE', 'ADMIN'].includes(role)) {
      where.role = role;
    }

    let users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        groups: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });

    // If excludeGroupId is provided, filter out users already in that group
    if (excludeGroupId) {
      users = users.filter(user => 
        !user.groups.some(group => group.id === excludeGroupId)
      );
    }

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching available users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch available users' },
      { status: 500 }
    );
  }
}