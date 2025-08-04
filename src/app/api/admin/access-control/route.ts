import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/config/auth/auth';
import prisma from '@/src/lib/prisma';
import { z } from 'zod';
import { ResourceType, AccessLevel, SubjectType } from '@prisma/client';

// Schema de validación para crear/editar AccessControl
const accessControlSchema = z.object({
  resourceType: z.nativeEnum(ResourceType),
  resourceId: z.string().min(1, 'Resource ID es requerido'),
  isEnabled: z.boolean().default(true),
  maxConcurrentUsers: z.number().min(0).optional(),
  maxAccessCount: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:mm format
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  daysOfWeek: z.array(z.string()).default([]),
  requiredAuthMethods: z.array(z.string()).default([]),
  rules: z.array(z.object({
    subjectType: z.nativeEnum(SubjectType),
    subjectValue: z.string().min(1),
    accessLevel: z.nativeEnum(AccessLevel),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    daysOfWeek: z.array(z.string()).default([]),
  })).default([]),
  ipRestrictions: z.array(z.object({
    startIP: z.string().ip(),
    endIP: z.string().ip().optional(),
  })).default([]),
  geoRestrictions: z.array(z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  })).default([]),
  deviceRestrictions: z.array(z.object({
    deviceType: z.string(),
    operatingSystems: z.array(z.string()).default([]),
  })).default([]),
});

const updateAccessControlSchema = accessControlSchema.partial();

// GET - Listar todos los controles de acceso
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const resourceType = searchParams.get('resourceType');
    const isEnabled = searchParams.get('isEnabled');
    const search = searchParams.get('search');

    // Construir filtros
    const where: any = {};
    
    if (resourceType) {
      where.resourceType = resourceType;
    }
    
    if (isEnabled !== null && isEnabled !== undefined) {
      where.isEnabled = isEnabled === 'true';
    }
    
    if (search) {
      where.OR = [
        { resourceId: { contains: search, mode: 'insensitive' } },
        { rules: { some: { subjectValue: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Obtener controles de acceso con paginación
    const [accessControls, totalCount] = await Promise.all([
      prisma.accessControl.findMany({
        where,
        include: {
          rules: true,
          ipRestrictions: true,
          geoRestrictions: true,
          deviceRestrictions: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.accessControl.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      accessControls,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Error obteniendo controles de acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo control de acceso
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = accessControlSchema.parse(body);

    // Verificar si ya existe un control para este recurso
    const existingControl = await prisma.accessControl.findFirst({
      where: {
        resourceType: validatedData.resourceType,
        resourceId: validatedData.resourceId,
      },
    });

    if (existingControl) {
      return NextResponse.json(
        { error: 'Ya existe un control de acceso para este recurso' },
        { status: 409 }
      );
    }

    // Crear el control de acceso con todas las relaciones
    const accessControl = await prisma.accessControl.create({
      data: {
        resourceType: validatedData.resourceType,
        resourceId: validatedData.resourceId,
        isEnabled: validatedData.isEnabled,
        maxConcurrentUsers: validatedData.maxConcurrentUsers,
        maxAccessCount: validatedData.maxAccessCount,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        daysOfWeek: validatedData.daysOfWeek,
        requiredAuthMethods: validatedData.requiredAuthMethods,
        rules: {
          create: validatedData.rules.map(rule => ({
            subjectType: rule.subjectType,
            subjectValue: rule.subjectValue,
            accessLevel: rule.accessLevel,
            startDate: rule.startDate ? new Date(rule.startDate) : null,
            endDate: rule.endDate ? new Date(rule.endDate) : null,
            startTime: rule.startTime,
            endTime: rule.endTime,
            daysOfWeek: rule.daysOfWeek,
          })),
        },
        ipRestrictions: {
          create: validatedData.ipRestrictions,
        },
        geoRestrictions: {
          create: validatedData.geoRestrictions,
        },
        deviceRestrictions: {
          create: validatedData.deviceRestrictions,
        },
      },
      include: {
        rules: true,
        ipRestrictions: true,
        geoRestrictions: true,
        deviceRestrictions: true,
      },
    });

    // Limpiar cache si existe
    // TODO: Implementar invalidación de cache específica

    return NextResponse.json({
      success: true,
      message: 'Control de acceso creado exitosamente',
      accessControl,
    }, { status: 201 });

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

    console.error('Error creando control de acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar múltiples controles de acceso
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere rol ADMIN' },
        { status: 403 }
      );
    }

    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs requeridos para eliminación' },
        { status: 400 }
      );
    }

    // Eliminar controles de acceso (cascade elimina reglas y restricciones)
    const deletedCount = await prisma.accessControl.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${deletedCount.count} controles de acceso eliminados`,
      deletedCount: deletedCount.count,
    });

  } catch (error) {
    console.error('Error eliminando controles de acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}