import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/src/config/auth/auth';
import prisma from "@/prisma/database";

// POST - Add users to group
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User IDs array is required' },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id },
      select: { userIds: true }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Validate user IDs
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true }
    });

    if (existingUsers.length !== userIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some user IDs are invalid' },
        { status: 400 }
      );
    }

    // Merge with existing users (avoid duplicates)
    const updatedUserIds = [...new Set([...group.userIds, ...userIds])];

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: { userIds: updatedUserIds },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: `${userIds.length} user(s) added to group`
    });
  } catch (error) {
    console.error('Error adding users to group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add users to group' },
      { status: 500 }
    );
  }
}

// DELETE - Remove users from group
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User IDs array is required' },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id },
      select: { userIds: true }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Remove specified users from group
    const updatedUserIds = group.userIds.filter(userId => !userIds.includes(userId));

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: { userIds: updatedUserIds },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: `${userIds.length} user(s) removed from group`
    });
  } catch (error) {
    console.error('Error removing users from group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove users from group' },
      { status: 500 }
    );
  }
}