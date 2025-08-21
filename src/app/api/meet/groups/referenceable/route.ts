import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/src/lib/prisma";
import { withApiKeyAuth } from "@/src/middleware/withApiKeyAuth";

// GET /api/meet/groups/referenceable - Obtener grupos que pueden ser referenciados
async function handleGet(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const excludeGroupId = searchParams.get("exclude"); // Excluir un grupo específico
    const search = searchParams.get("search"); // Término de búsqueda
    const type = searchParams.get("type"); // Filtrar por tipo si existe

    // Construir condiciones de filtro
    const whereConditions: any = {
      allowsReferences: true,
      isActive: true
    };

    // Excluir grupo específico (para evitar auto-referencias)
    if (excludeGroupId) {
      whereConditions.id = {
        not: excludeGroupId
      };
    }

    // Filtro de búsqueda
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { customId: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtro por tipo (si existe campo type en el modelo)
    // if (type) {
    //   whereConditions.type = type;
    // }

    // Obtener grupos que pueden ser referenciados
    const referenceableGroups = await prisma.meetGroup.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        customId: true,
        internalDescription: true,
        publicDescription: true,
        level: true,
        parentId: true,
        referenceCount: true,
        path: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    // Agrupar por categoría (basado en level o parent)
    const groupedResults = {
      masters: referenceableGroups.filter(group => 
        group.path.includes('/masters') || 
        group.name.toLowerCase().includes('máster') ||
        group.name.toLowerCase().includes('master')
      ),
      services: referenceableGroups.filter(group => 
        group.path.includes('/servicios') || 
        group.path.includes('/services') ||
        (!group.path.includes('/masters') && 
         !group.name.toLowerCase().includes('máster') &&
         !group.name.toLowerCase().includes('master'))
      )
    };

    return NextResponse.json({
      groups: referenceableGroups,
      grouped: groupedResults,
      count: referenceableGroups.length
    });

  } catch (error) {
    console.error("Error fetching referenceable groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Configurar middleware de autenticación
export const GET = withApiKeyAuth(handleGet);