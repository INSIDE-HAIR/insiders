import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { withApiKeyAuth } from "@/src/middleware/withApiKeyAuth";
import { z } from "zod";

// Schema para asignar tag a grupo
const assignTagSchema = z.object({
  tagId: z.string().min(1, "Tag ID is required"),
});

// Schema para remover tag de grupo
const removeTagSchema = z.object({
  tagId: z.string().min(1, "Tag ID is required"),
});

// Helper para autenticación dual
async function authenticateRequest(request: NextRequest) {
  // Verificar si hay API key primero
  const apiKeyUserId = request.headers.get("x-api-key-user-id");
  if (apiKeyUserId) {
    return {
      userId: apiKeyUserId,
      isAdmin: true, // API keys tienen privilegios de admin
      isApiKey: true
    };
  }

  // Verificar autenticación de sesión
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Sin permisos");
  }

  return {
    userId: session.user.id,
    isAdmin: true,
    isApiKey: false
  };
}

/**
 * GET /api/meet/groups/[id]/tags
 * Obtiene todos los tags asignados a un grupo
 */
async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación dual
    const authResult = await authenticateRequest(request);

    const resolvedParams = await params;
    const groupId = resolvedParams.id;
    
    storageService = new MeetStorageService();
    
    // Verificar que el grupo existe
    const group = await storageService.prisma.meetGroup.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    
    // Obtener todos los tags asignados al grupo
    const groupTags = await storageService.prisma.meetGroupDefaultTag.findMany({
      where: { groupId },
      include: {
        tag: {
          include: {
            parent: true,
            children: {
              orderBy: [{ order: 'asc' }, { name: 'asc' }]
            },
            _count: {
              select: {
                children: true,
                assignedToGroups: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return NextResponse.json({
      groupId,
      groupName: group.name,
      tags: groupTags.map(gt => gt.tag),
      totalTags: groupTags.length
    });

  } catch (error: any) {
    console.error("Failed to get group tags:", error);
    
    return NextResponse.json({
      error: "Error getting group tags",
      details: error.message
    }, { status: 500 });
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * POST /api/meet/groups/[id]/tags
 * Asigna un tag a un grupo
 */
async function handlePost(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación dual
    const authResult = await authenticateRequest(request);

    const resolvedParams = await params;
    const groupId = resolvedParams.id;
    
    // Parsear y validar body
    const body = await request.json();
    const validation = assignTagSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid tag assignment data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { tagId } = validation.data;
    storageService = new MeetStorageService();
    
    // Verificar que el grupo existe
    const group = await storageService.prisma.meetGroup.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    
    // Verificar que el tag existe
    const tag = await storageService.prisma.meetTag.findUnique({
      where: { id: tagId }
    });
    
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    
    // Verificar si ya está asignado
    const existingAssignment = await storageService.prisma.meetGroupDefaultTag.findUnique({
      where: {
        groupId_tagId: {
          groupId,
          tagId
        }
      }
    });
    
    if (existingAssignment) {
      return NextResponse.json(
        { 
          error: "Tag already assigned to group",
          groupId,
          tagId,
          tagName: tag.name
        },
        { status: 409 }
      );
    }
    
    // Asignar tag al grupo
    const assignment = await storageService.prisma.meetGroupDefaultTag.create({
      data: {
        groupId,
        tagId,
        createdBy: authResult.userId
      },
      include: {
        tag: {
          include: {
            parent: true
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    // Log de operación
    await storageService.logOperation(
      'assign_tag_to_group',
      groupId,
      true,
      200,
      `Tag ${tag.name} assigned to group ${group.name}`,
      authResult.userId
    );
    
    console.log(`🏷️ Tag "${tag.name}" assigned to group "${group.name}"`);
    
    return NextResponse.json({
      success: true,
      message: `Tag "${tag.name}" assigned to group "${group.name}"`,
      assignment: {
        groupId: assignment.groupId,
        tagId: assignment.tagId,
        group: assignment.group,
        tag: assignment.tag,
        createdAt: assignment.createdAt
      }
    });

  } catch (error: any) {
    console.error("Failed to assign tag to group:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error assigning tag to group",
        details: error.stack 
      },
      { status: 500 }
    );
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * DELETE /api/meet/groups/[id]/tags
 * Remueve un tag de un grupo
 */
async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación dual
    const authResult = await authenticateRequest(request);

    const resolvedParams = await params;
    const groupId = resolvedParams.id;
    
    // Parsear y validar body
    const body = await request.json();
    const validation = removeTagSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid tag removal data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { tagId } = validation.data;
    storageService = new MeetStorageService();
    
    // Verificar que el grupo existe
    const group = await storageService.prisma.meetGroup.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    
    // Verificar que el tag existe
    const tag = await storageService.prisma.meetTag.findUnique({
      where: { id: tagId }
    });
    
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    
    // Verificar si está asignado
    const existingAssignment = await storageService.prisma.meetGroupDefaultTag.findUnique({
      where: {
        groupId_tagId: {
          groupId,
          tagId
        }
      }
    });
    
    if (!existingAssignment) {
      return NextResponse.json(
        { 
          error: "Tag not assigned to group",
          groupId,
          tagId,
          tagName: tag.name
        },
        { status: 404 }
      );
    }
    
    // Remover tag del grupo
    await storageService.prisma.meetGroupDefaultTag.delete({
      where: {
        groupId_tagId: {
          groupId,
          tagId
        }
      }
    });
    
    // Log de operación
    await storageService.logOperation(
      'remove_tag_from_group',
      groupId,
      true,
      200,
      `Tag ${tag.name} removed from group ${group.name}`,
      authResult.userId
    );
    
    console.log(`🏷️ Tag "${tag.name}" removed from group "${group.name}"`);
    
    return NextResponse.json({
      success: true,
      message: `Tag "${tag.name}" removed from group "${group.name}"`,
      groupId,
      tagId,
      groupName: group.name,
      tagName: tag.name
    });

  } catch (error: any) {
    console.error("Failed to remove tag from group:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error removing tag from group",
        details: error.stack 
      },
      { status: 500 }
    );
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

// Configurar middleware de autenticación para soporte dual
export const GET = withApiKeyAuth(handleGet);
export const POST = withApiKeyAuth(handlePost);
export const DELETE = withApiKeyAuth(handleDelete);