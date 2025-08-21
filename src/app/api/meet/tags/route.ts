import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { withApiKeyAuth } from "@/src/middleware/withApiKeyAuth";
import { z } from "zod";

// Schema para crear tag
const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  internalDescription: z.string().optional(),
  publicDescription: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color").default("#3B82F6"),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  customId: z.string().optional(),
  order: z.number().int().optional(),
});

/**
 * GET /api/meet/tags
 * Lista todos los tags con jerarquía
 */
async function handleGet(request: NextRequest) {
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
    
    // Obtener tags con relaciones
    const tags = await storageService.getTags(
      where,
      {
        parent: true,
        children: true,
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
      result = buildTagTree(tags);
    } else {
      result = tags;
    }
    
    return NextResponse.json({
      tags: result,
      total: tags.length
    });

  } catch (error: any) {
    console.error("Failed to list tags:", error);
    
    return NextResponse.json({
      error: "Error listing tags",
      details: error.message
    }, { status: 500 });
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * POST /api/meet/tags
 * Crea un nuevo tag
 */
async function handlePost(request: NextRequest) {
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

    // Parsear y validar body
    const body = await request.json();
    const validation = createTagSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid tag data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const tagData = validation.data;
    storageService = new MeetStorageService();
    
    // Verificar que el slug sea único
    const existingTag = await storageService.getTagBySlug(tagData.slug);
    
    if (existingTag) {
      return NextResponse.json(
        { error: "Tag with this slug already exists" },
        { status: 409 }
      );
    }
    
    // Crear tag
    const tag = await storageService.createTag({
      ...tagData,
      parentId: tagData.parentId || undefined, // Ensure empty string becomes undefined
      createdBy: userId
    });
    
    // Log de operación
    await storageService.logOperation(
      'create_tag',
      tag.id,
      true,
      201,
      null,
      userId
    );
    
    return NextResponse.json(tag, { status: 201 });

  } catch (error: any) {
    console.error("Failed to create tag:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error creating tag",
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
function buildTagTree(tags: any[]): any[] {
  const tagMap = new Map();
  const roots: any[] = [];
  
  // Primer paso: crear mapa de todos los tags
  tags.forEach(tag => {
    tagMap.set(tag.id, { ...tag, children: [] });
  });
  
  // Segundo paso: construir árbol
  tags.forEach(tag => {
    const tagNode = tagMap.get(tag.id);
    if (tag.parentId) {
      const parent = tagMap.get(tag.parentId);
      if (parent) {
        parent.children.push(tagNode);
      }
    } else {
      roots.push(tagNode);
    }
  });
  
  return roots;
}

// Configurar middleware de autenticación para soporte dual
export const GET = withApiKeyAuth(handleGet);
export const POST = withApiKeyAuth(handlePost);