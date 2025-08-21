import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "@/src/lib/prisma";
import { withApiKeyAuth } from "@/src/middleware/withApiKeyAuth";

// Esquema de validación para actualización
const updateReferenceSchema = z.object({
  displayName: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional()
});

// GET /api/meet/groups/[id]/references/[refId] - Obtener referencia específica
async function handleGet(request: NextRequest, { params }: { params: Promise<{ id: string, refId: string }> }) {
  try {
    const resolvedParams = await params;
    const { id: sourceGroupId, refId } = resolvedParams;

    const reference = await prisma.meetGroupReference.findFirst({
      where: { 
        id: refId,
        sourceGroupId: sourceGroupId
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
      }
    });

    if (!reference) {
      return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    }

    return NextResponse.json({ reference });

  } catch (error) {
    console.error("Error fetching reference:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/meet/groups/[id]/references/[refId] - Actualizar referencia
async function handlePut(request: NextRequest, { params }: { params: Promise<{ id: string, refId: string }> }) {
  try {
    const resolvedParams = await params;
    const { id: sourceGroupId, refId } = resolvedParams;
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = updateReferenceSchema.parse(body);

    // Verificar que la referencia existe y pertenece al grupo
    const existingReference = await prisma.meetGroupReference.findFirst({
      where: { 
        id: refId,
        sourceGroupId: sourceGroupId
      }
    });

    if (!existingReference) {
      return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    }

    // Actualizar la referencia
    const updatedReference = await prisma.meetGroupReference.update({
      where: { id: refId },
      data: {
        ...validatedData,
        updatedAt: new Date()
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

    return NextResponse.json({ 
      reference: updatedReference,
      message: "Reference updated successfully"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating reference:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/meet/groups/[id]/references/[refId] - Eliminar referencia
async function handleDelete(request: NextRequest, { params }: { params: Promise<{ id: string, refId: string }> }) {
  try {
    const resolvedParams = await params;
    const { id: sourceGroupId, refId } = resolvedParams;

    // Verificar que la referencia existe y pertenece al grupo
    const existingReference = await prisma.meetGroupReference.findFirst({
      where: { 
        id: refId,
        sourceGroupId: sourceGroupId
      }
    });

    if (!existingReference) {
      return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    }

    // Eliminar la referencia y actualizar contador en transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar la referencia
      await tx.meetGroupReference.delete({
        where: { id: refId }
      });

      // Decrementar contador en el grupo destino
      await tx.meetGroup.update({
        where: { id: existingReference.targetGroupId },
        data: {
          referenceCount: {
            decrement: 1
          }
        }
      });
    });

    return NextResponse.json({ 
      message: "Reference deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting reference:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Configurar middleware de autenticación
export const GET = withApiKeyAuth(handleGet);
export const PUT = withApiKeyAuth(handlePut);
export const DELETE = withApiKeyAuth(handleDelete);