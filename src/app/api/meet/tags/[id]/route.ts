import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { z } from "zod";

// Schema para actualizar tag
const updateTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50).optional(),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only").optional(),
  internalDescription: z.string().optional(),
  publicDescription: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color").optional(),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  customId: z.string().optional(),
  order: z.number().int().optional(),
});

/**
 * GET /api/meet/tags/[id]
 * Obtiene un tag específico con toda su información
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación (session o API key)
    const apiKeyUserId = request.headers.get("x-api-key-user-id");
    let userId: string;
    let isAdmin = false;

    if (apiKeyUserId) {
      // Autenticación por API Key
      userId = apiKeyUserId;
      isAdmin = true; // API keys have admin privileges
      console.log("🔐 Authenticated via API Key");
    } else {
      // Autenticación por sesión
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }
      userId = session.user.id;
      isAdmin = session.user.role === "ADMIN";
    }

    // Verificar permisos de admin
    if (!isAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const resolvedParams = await params;
    const tagId = resolvedParams.id;
    
    storageService = new MeetStorageService();
    
    const tag = await storageService.prisma.meetTag.findUnique({
      where: { id: tagId },
      include: {
        parent: true,
        children: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }]
        },
        spaceTags: {
          include: {
            space: true
          }
        },
        assignedToGroups: {
          include: {
            group: true
          }
        },
        _count: {
          select: {
            children: true,
            spaceTags: true
          }
        }
      }
    });
    
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    
    return NextResponse.json(tag);

  } catch (error: any) {
    console.error("Failed to get tag:", error);
    
    return NextResponse.json({
      error: "Error getting tag",
      details: error.message
    }, { status: 500 });
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * PUT /api/meet/tags/[id]
 * Actualiza un tag existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación (session o API key)
    const apiKeyUserId = request.headers.get("x-api-key-user-id");
    let userId: string;
    let isAdmin = false;

    if (apiKeyUserId) {
      // Autenticación por API Key
      userId = apiKeyUserId;
      isAdmin = true; // API keys have admin privileges
      console.log("🔐 Authenticated via API Key");
    } else {
      // Autenticación por sesión
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }
      userId = session.user.id;
      isAdmin = session.user.role === "ADMIN";
    }

    // Verificar permisos de admin
    if (!isAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const resolvedParams = await params;
    const tagId = resolvedParams.id;
    
    // Parsear y validar body
    const body = await request.json();
    console.log("📝 Update tag request body:", JSON.stringify(body, null, 2));
    
    const validation = updateTagSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("❌ Tag validation failed:", validation.error.errors);
      return NextResponse.json(
        { 
          error: "Invalid tag data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;
    storageService = new MeetStorageService();
    
    // Verificar que el tag existe
    const existingTag = await storageService.prisma.meetTag.findUnique({
      where: { id: tagId }
    });
    
    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    
    // Verificar slug único si se está cambiando
    if (updateData.slug && updateData.slug !== existingTag.slug) {
      const duplicateSlug = await storageService.prisma.meetTag.findUnique({
        where: { slug: updateData.slug }
      });
      
      if (duplicateSlug) {
        return NextResponse.json(
          { error: "Tag with this slug already exists" },
          { status: 409 }
        );
      }
    }
    
    // Si se cambia el parent, recalcular path y level
    let pathUpdateData: any = {};
    if (updateData.parentId !== undefined && updateData.parentId !== existingTag.parentId) {
      console.log("🔄 Parent change detected:", {
        oldParent: existingTag.parentId,
        newParent: updateData.parentId,
        tagId
      });
      
      let newPath = `/${updateData.slug || existingTag.slug}`;
      let newLevel = 0;
      
      if (updateData.parentId) {
        console.log("🔍 Looking for parent tag:", updateData.parentId);
        const newParent = await storageService.prisma.meetTag.findUnique({
          where: { id: updateData.parentId }
        });
        
        if (!newParent) {
          console.error("❌ Parent tag not found:", updateData.parentId);
          return NextResponse.json(
            { error: "Parent tag not found" },
            { status: 400 }
          );
        }
        
        console.log("✅ Parent tag found:", { id: newParent.id, name: newParent.name, path: newParent.path });
        
        // Prevenir loops de jerarquía - solo bloquear si el nuevo padre es un descendiente
        console.log("🔍 Checking for hierarchy loops...");
        const tagDescendants = await getAllDescendants(tagId, storageService);
        console.log("📋 Descendants of current tag:", tagDescendants);
        console.log("🎯 Proposed parent ID:", updateData.parentId);
        
        // Solo bloquear si el nuevo padre es un descendiente del tag actual
        if (tagDescendants.includes(updateData.parentId)) {
          console.error("❌ Hierarchy loop detected - proposed parent is a descendant");
          
          return NextResponse.json(
            { 
              error: "Cannot set descendant as parent (would create loop)",
              details: `Cannot make "${newParent.name}" a parent because it is a descendant of this tag`
            },
            { status: 400 }
          );
        }
        
        console.log("✅ No hierarchy loop - move is allowed");
        
        newPath = `${newParent.path}/${updateData.slug || existingTag.slug}`;
        newLevel = newParent.level + 1;
      }
      
      console.log("📍 New path calculated:", { newPath, newLevel });
      pathUpdateData = { path: newPath, level: newLevel };
      
      // También actualizar paths de todos los descendientes
      console.log("🔄 Updating descendant paths...");
      await updateDescendantPaths(tagId, newPath, newLevel, storageService);
    }
    
    // Actualizar tag
    console.log("💾 Updating tag with data:", { updateData, pathUpdateData });
    const updatedTag = await storageService.prisma.meetTag.update({
      where: { id: tagId },
      data: {
        ...updateData,
        ...pathUpdateData
      },
      include: {
        parent: true,
        children: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }]
        },
        _count: {
          select: {
            children: true,
            spaceTags: true
          }
        }
      }
    });
    
    console.log("✅ Tag updated successfully:", updatedTag.name);
    
    // Log de operación
    await storageService.logOperation(
      'update_tag',
      tagId,
      true,
      200,
      null,
      userId
    );
    
    return NextResponse.json(updatedTag);

  } catch (error: any) {
    console.error("Failed to update tag:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error updating tag",
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
 * DELETE /api/meet/tags/[id]
 * Elimina un tag
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación (session o API key)
    const apiKeyUserId = request.headers.get("x-api-key-user-id");
    let userId: string;
    let isAdmin = false;

    if (apiKeyUserId) {
      // Autenticación por API Key
      userId = apiKeyUserId;
      isAdmin = true; // API keys have admin privileges
      console.log("🔐 Authenticated via API Key");
    } else {
      // Autenticación por sesión
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }
      userId = session.user.id;
      isAdmin = session.user.role === "ADMIN";
    }

    // Verificar permisos de admin
    if (!isAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const resolvedParams = await params;
    const tagId = resolvedParams.id;
    
    storageService = new MeetStorageService();
    
    // Verificar que el tag existe
    const tag = await storageService.prisma.meetTag.findUnique({
      where: { id: tagId },
      include: {
        children: true,
        spaceTags: true
      }
    });
    
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    
    // Si tiene hijos, preguntar qué hacer
    if (tag.children.length > 0) {
      return NextResponse.json(
        { 
          error: "Tag has children",
          details: "Please reassign or delete children first",
          childrenCount: tag.children.length
        },
        { status: 409 }
      );
    }
    
    // Si está asignado a spaces, desasignar primero
    if (tag.spaceTags.length > 0) {
      await storageService.prisma.meetSpaceTag.deleteMany({
        where: { tagId }
      });
      console.log(`🏷️ Unassigned tag from ${tag.spaceTags.length} spaces`);
    }
    
    // Eliminar tag
    await storageService.prisma.meetTag.delete({
      where: { id: tagId }
    });
    
    // Log de operación
    await storageService.logOperation(
      'delete_tag',
      tagId,
      true,
      200,
      null,
      userId
    );
    
    console.log(`🗑️ Tag deleted: ${tag.name}`);
    
    return NextResponse.json({ 
      success: true,
      message: `Tag "${tag.name}" deleted successfully`
    });

  } catch (error: any) {
    console.error("Failed to delete tag:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error deleting tag",
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

// Helper: verificar si un tag es descendiente de otro (removed - using direct logic above)

// Helper: obtener todos los descendientes de un tag
async function getAllDescendants(tagId: string, storageService: MeetStorageService): Promise<string[]> {
  const children = await storageService.prisma.meetTag.findMany({
    where: { parentId: tagId },
    select: { id: true }
  });
  
  let descendants = children.map(c => c.id);
  
  for (const child of children) {
    const childDescendants = await getAllDescendants(child.id, storageService);
    descendants = [...descendants, ...childDescendants];
  }
  
  return descendants;
}

// Helper: actualizar paths de descendientes
async function updateDescendantPaths(tagId: string, newParentPath: string, newParentLevel: number, storageService: MeetStorageService): Promise<void> {
  const children = await storageService.prisma.meetTag.findMany({
    where: { parentId: tagId }
  });
  
  console.log(`🔄 Updating ${children.length} children of tag ${tagId}`);
  
  for (const child of children) {
    const newPath = `${newParentPath}/${child.slug}`;
    const newLevel = newParentLevel + 1;
    
    console.log(`📝 Updating child ${child.name}: ${child.path} -> ${newPath}`);
    
    await storageService.prisma.meetTag.update({
      where: { id: child.id },
      data: { path: newPath, level: newLevel }
    });
    
    // Recursivamente actualizar descendientes
    await updateDescendantPaths(child.id, newPath, newLevel, storageService);
  }
  
  console.log(`✅ Finished updating descendants of ${tagId}`);
}