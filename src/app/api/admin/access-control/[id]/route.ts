import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/config/auth/auth';
import prisma from '@/src/lib/prisma';
import { z } from 'zod';
import { ResourceType, AccessLevel, SubjectType } from '@prisma/client';

// Schema de validación para actualizar AccessControl
const updateAccessControlSchema = z.object({
  resourceType: z.nativeEnum(ResourceType).optional(),
  resourceId: z.string().min(1).optional(),
  isEnabled: z.boolean().optional(),
  maxConcurrentUsers: z.number().min(0).optional(),
  maxAccessCount: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  daysOfWeek: z.array(z.string()).optional(),
  requiredAuthMethods: z.array(z.string()).optional(),
  rules: z.array(z.object({
    id: z.string().optional(), // Para actualizar reglas existentes
    subjectType: z.nativeEnum(SubjectType),
    subjectValue: z.string().min(1),
    accessLevel: z.nativeEnum(AccessLevel),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    daysOfWeek: z.array(z.string()).default([]),
  })).optional(),
  ipRestrictions: z.array(z.object({
    id: z.string().optional(),
    startIP: z.string().ip(),
    endIP: z.string().ip().optional(),
  })).optional(),
  geoRestrictions: z.array(z.object({
    id: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  })).optional(),
  deviceRestrictions: z.array(z.object({
    id: z.string().optional(),
    deviceType: z.string(),
    operatingSystems: z.array(z.string()).default([]),
  })).optional(),
});

// GET - Obtener control de acceso por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const { id } = params;

    const accessControl = await prisma.accessControl.findUnique({
      where: { id },
      include: {
        rules: true,
        ipRestrictions: true,
        geoRestrictions: true,
        deviceRestrictions: true,
      },
    });

    if (!accessControl) {
      return NextResponse.json(
        { error: 'Control de acceso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accessControl,
    });

  } catch (error) {
    console.error('Error obteniendo control de acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar control de acceso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateAccessControlSchema.parse(body);

    // Verificar que el control existe
    const existingControl = await prisma.accessControl.findUnique({
      where: { id },
      include: {
        rules: true,
        ipRestrictions: true,
        geoRestrictions: true,
        deviceRestrictions: true,
      },
    });

    if (!existingControl) {
      return NextResponse.json(
        { error: 'Control de acceso no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar usando transacción para mantener consistencia
    const updatedAccessControl = await prisma.$transaction(async (tx) => {
      // Actualizar datos principales
      const mainData: any = {};
      if (validatedData.resourceType !== undefined) mainData.resourceType = validatedData.resourceType;
      if (validatedData.resourceId !== undefined) mainData.resourceId = validatedData.resourceId;
      if (validatedData.isEnabled !== undefined) mainData.isEnabled = validatedData.isEnabled;
      if (validatedData.maxConcurrentUsers !== undefined) mainData.maxConcurrentUsers = validatedData.maxConcurrentUsers;
      if (validatedData.maxAccessCount !== undefined) mainData.maxAccessCount = validatedData.maxAccessCount;
      if (validatedData.startDate !== undefined) mainData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
      if (validatedData.endDate !== undefined) mainData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
      if (validatedData.startTime !== undefined) mainData.startTime = validatedData.startTime;
      if (validatedData.endTime !== undefined) mainData.endTime = validatedData.endTime;
      if (validatedData.daysOfWeek !== undefined) mainData.daysOfWeek = validatedData.daysOfWeek;
      if (validatedData.requiredAuthMethods !== undefined) mainData.requiredAuthMethods = validatedData.requiredAuthMethods;

      const updated = await tx.accessControl.update({
        where: { id },
        data: mainData,
      });

      // Actualizar reglas si se proporcionaron
      if (validatedData.rules) {
        // Eliminar reglas existentes
        await tx.accessRule.deleteMany({
          where: { accessControlId: id },
        });

        // Crear nuevas reglas
        if (validatedData.rules.length > 0) {
          await tx.accessRule.createMany({
            data: validatedData.rules.map(rule => ({
              accessControlId: id,
              subjectType: rule.subjectType,
              subjectValue: rule.subjectValue,
              accessLevel: rule.accessLevel,
              startDate: rule.startDate ? new Date(rule.startDate) : null,
              endDate: rule.endDate ? new Date(rule.endDate) : null,
              startTime: rule.startTime,
              endTime: rule.endTime,
              daysOfWeek: rule.daysOfWeek,
            })),
          });
        }
      }

      // Actualizar restricciones IP si se proporcionaron
      if (validatedData.ipRestrictions) {
        await tx.iPRestriction.deleteMany({
          where: { accessControlId: id },
        });

        if (validatedData.ipRestrictions.length > 0) {
          await tx.iPRestriction.createMany({
            data: validatedData.ipRestrictions.map(restriction => ({
              accessControlId: id,
              startIP: restriction.startIP,
              endIP: restriction.endIP,
            })),
          });
        }
      }

      // Actualizar restricciones geográficas si se proporcionaron
      if (validatedData.geoRestrictions) {
        await tx.geoRestriction.deleteMany({
          where: { accessControlId: id },
        });

        if (validatedData.geoRestrictions.length > 0) {
          await tx.geoRestriction.createMany({
            data: validatedData.geoRestrictions.map(restriction => ({
              accessControlId: id,
              country: restriction.country,
              region: restriction.region,
              city: restriction.city,
            })),
          });
        }
      }

      // Actualizar restricciones de dispositivo si se proporcionaron
      if (validatedData.deviceRestrictions) {
        await tx.deviceRestriction.deleteMany({
          where: { accessControlId: id },
        });

        if (validatedData.deviceRestrictions.length > 0) {
          await tx.deviceRestriction.createMany({
            data: validatedData.deviceRestrictions.map(restriction => ({
              accessControlId: id,
              deviceType: restriction.deviceType,
              operatingSystems: restriction.operatingSystems,
            })),
          });
        }
      }

      return updated;
    });

    // Obtener el control actualizado con todas las relaciones
    const finalAccessControl = await prisma.accessControl.findUnique({
      where: { id },
      include: {
        rules: true,
        ipRestrictions: true,
        geoRestrictions: true,
        deviceRestrictions: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Control de acceso actualizado exitosamente',
      accessControl: finalAccessControl,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error actualizando control de acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar control de acceso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Verificar que el control existe
    const existingControl = await prisma.accessControl.findUnique({
      where: { id },
    });

    if (!existingControl) {
      return NextResponse.json(
        { error: 'Control de acceso no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el control (cascade elimina relaciones)
    await prisma.accessControl.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Control de acceso eliminado exitosamente',
    });

  } catch (error) {
    console.error('Error eliminando control de acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}