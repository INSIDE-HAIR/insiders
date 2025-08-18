import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { z } from "zod";

// Schema para crear grupo
const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  internalDescription: z.string().optional(),
  publicDescription: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color").default("#6B7280"),
  parentId: z.string().optional(),
  customId: z.string().optional(),
  order: z.number().int().optional(),
  defaultTagIds: z.array(z.string()).optional(), // Tags por defecto para asignar automáticamente
});

/**
 * GET /api/meet/groups
 * Lista todos los grupos con jerarquía
 */
export async function GET(request: NextRequest) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    storageService = new MeetStorageService();
    
    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get("parentId");
    const level = searchParams.get("level");
    const isActive = searchParams.get("isActive");
    
    // Construir filtros
    const where: any = {};
    if (parentId !== null && parentId !== "all") {
      where.parentId = parentId === "null" ? null : parentId;
    }
    // Si parentId es "all", no agregamos filtro de parentId (devuelve todos)
    if (level !== null) {
      where.level = parseInt(level);
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    // Obtener grupos con relaciones
    const groups = await storageService.getGroups(
      where,
      {
        parent: true,
        children: true,
        defaultTags: {
          include: {
            tag: true
          }
        },
        spaceGroups: {
          include: {
            space: true
          }
        },
        _count: {
          select: {
            children: true,
            spaceGroups: true,
            defaultTags: true
          }
        }
      },
      [
        { level: 'asc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    );
    
    // Construir árbol jerárquico si no hay filtro de parent específico
    let result;
    if (parentId === null) {
      result = buildGroupTree(groups);
    } else {
      result = groups;
    }
    
    return NextResponse.json({
      groups: result,
      total: groups.length
    });

  } catch (error: any) {
    console.error("Failed to list groups:", error);
    
    return NextResponse.json({
      error: "Error listing groups",
      details: error.message
    }, { status: 500 });
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * POST /api/meet/groups
 * Crea un nuevo grupo
 */
export async function POST(request: NextRequest) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Parsear y validar body
    const body = await request.json();
    const validation = createGroupSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid group data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { defaultTagIds, ...groupData } = validation.data;
    storageService = new MeetStorageService();
    
    // Verificar que el slug sea único
    const existingGroup = await storageService.getGroupBySlug(groupData.slug);
    
    if (existingGroup) {
      return NextResponse.json(
        { error: "Group with this slug already exists" },
        { status: 409 }
      );
    }
    
    // Crear grupo
    const group = await storageService.createGroup({
      ...groupData,
      parentId: groupData.parentId || undefined, // Ensure empty string becomes undefined
      createdBy: session.user.id
    });
    
    // Asignar tags por defecto si se proporcionaron
    if (defaultTagIds && defaultTagIds.length > 0) {
      // Verificar que todos los tags existen
      const existingTags = await storageService.prisma.meetTag.findMany({
        where: {
          id: { in: defaultTagIds }
        }
      });
      
      if (existingTags.length !== defaultTagIds.length) {
        console.warn("Some default tags were not found");
      }
      
      // Crear relaciones de tags por defecto
      // Assign default tags one by one to handle duplicates gracefully
      for (const tag of existingTags) {
        try {
          await storageService.prisma.meetGroupDefaultTag.create({
            data: {
              groupId: group.id,
              tagId: tag.id,
              createdBy: session.user.id
            }
          });
        } catch (error) {
          // Ignore duplicate key errors
          console.warn(`Tag ${tag.id} already assigned to group ${group.id}`);
        }
      }
      
      console.log(`🏷️ Assigned ${existingTags.length} default tags to group ${group.name}`);
    }
    
    // Obtener el grupo con sus relaciones
    const groupWithRelations = await storageService.prisma.meetGroup.findUnique({
      where: { id: group.id },
      include: {
        parent: true,
        defaultTags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            children: true,
            spaceGroups: true,
            defaultTags: true
          }
        }
      }
    });
    
    // Log de operación
    await storageService.logOperation(
      'create_group',
      group.id,
      true,
      201,
      null,
      session.user.id
    );
    
    return NextResponse.json(groupWithRelations, { status: 201 });

  } catch (error: any) {
    console.error("Failed to create group:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error creating group",
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

// Helper function para construir árbol jerárquico
function buildGroupTree(groups: any[]): any[] {
  const groupMap = new Map();
  const roots: any[] = [];
  
  // Primer paso: crear mapa de todos los grupos
  groups.forEach(group => {
    groupMap.set(group.id, { ...group, children: [] });
  });
  
  // Segundo paso: construir árbol
  groups.forEach(group => {
    const groupNode = groupMap.get(group.id);
    if (group.parentId) {
      const parent = groupMap.get(group.parentId);
      if (parent) {
        parent.children.push(groupNode);
      }
    } else {
      roots.push(groupNode);
    }
  });
  
  return roots;
}