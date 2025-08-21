import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "@/src/lib/prisma";
import { withApiKeyAuth } from "@/src/middleware/withApiKeyAuth";

// Esquemas de validación
const createReferenceSchema = z.object({
  targetGroupId: z.string().min(1, "Target group ID is required"),
  displayName: z.string().optional(),
  description: z.string().optional(),
  order: z.number().default(0)
});

// GET /api/meet/groups/[id]/references - Obtener todas las referencias de un grupo
async function handleGet(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const groupId = resolvedParams.id;

    // Verificar que el grupo existe
    const group = await prisma.meetGroup.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Obtener todas las referencias del grupo
    const references = await prisma.meetGroupReference.findMany({
      where: { 
        sourceGroupId: groupId,
        isActive: true 
      },
      include: {
        targetGroup: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            customId: true,
            internalDescription: true,
            publicDescription: true,
            allowsReferences: true,
            referenceCount: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json({ 
      references,
      count: references.length
    });

  } catch (error) {
    console.error("Error fetching group references:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/meet/groups/[id]/references - Crear nueva referencia
async function handlePost(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const sourceGroupId = resolvedParams.id;
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = createReferenceSchema.parse(body);
    const { targetGroupId, displayName, description, order } = validatedData;

    // Verificar que el grupo fuente existe
    const sourceGroup = await prisma.meetGroup.findUnique({
      where: { id: sourceGroupId }
    });

    if (!sourceGroup) {
      return NextResponse.json({ error: "Source group not found" }, { status: 404 });
    }

    // Verificar que el grupo destino existe y permite referencias
    const targetGroup = await prisma.meetGroup.findUnique({
      where: { id: targetGroupId }
    });

    if (!targetGroup) {
      return NextResponse.json({ error: "Target group not found" }, { status: 404 });
    }

    if (!targetGroup.allowsReferences) {
      return NextResponse.json({ 
        error: "Target group does not allow references" 
      }, { status: 400 });
    }

    // Verificar que no sea auto-referencia
    if (sourceGroupId === targetGroupId) {
      return NextResponse.json({ 
        error: "Cannot create self-reference" 
      }, { status: 400 });
    }

    // Verificar que no existe ya la referencia
    const existingReference = await prisma.meetGroupReference.findUnique({
      where: {
        sourceGroupId_targetGroupId: {
          sourceGroupId,
          targetGroupId
        }
      }
    });

    if (existingReference) {
      return NextResponse.json({ 
        error: "Reference already exists" 
      }, { status: 409 });
    }

    // Crear la referencia y actualizar contador en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la referencia
      const reference = await tx.meetGroupReference.create({
        data: {
          sourceGroupId,
          targetGroupId,
          displayName,
          description,
          order,
          createdBy: request.headers.get("x-api-key-user-id") || undefined
        },
        include: {
          targetGroup: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              customId: true,
              internalDescription: true,
              publicDescription: true
            }
          }
        }
      });

      // Incrementar contador en el grupo destino
      await tx.meetGroup.update({
        where: { id: targetGroupId },
        data: {
          referenceCount: {
            increment: 1
          }
        }
      });

      return reference;
    });

    return NextResponse.json({ 
      reference: result,
      message: "Reference created successfully"
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating group reference:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Configurar middleware de autenticación
export const GET = withApiKeyAuth(handleGet);
export const POST = withApiKeyAuth(handlePost);