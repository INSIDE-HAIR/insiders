import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/src/config/auth/auth';
import prisma from "@/prisma/database";

// GET - Get group by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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

    const group = await prisma.group.findUnique({
      where: { id },
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

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

// PUT - Update group
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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
    const { name, description, userIds } = body;

    const existingGroup = await prisma.group.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing group (excluding current group)
    if (name && name.trim() !== existingGroup.name) {
      const nameConflict = await prisma.group.findFirst({
        where: {
          name: name.trim(),
          id: { not: id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: 'Group with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Validate user IDs if provided
    if (userIds && userIds.length > 0) {
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
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (userIds !== undefined) updateData.userIds = userIds || [];

    const group = await prisma.group.update({
      where: { id },
      data: updateData,
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
      data: group
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE - Delete group
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

    const existingGroup = await prisma.group.findUnique({
      where: { id },
      include: {
        users: true
      }
    });

    if (!existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if group has users assigned
    if (existingGroup.users.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete group that has users assigned. Remove all users first.' 
        },
        { status: 400 }
      );
    }

    await prisma.group.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}