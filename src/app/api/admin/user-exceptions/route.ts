import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/config/auth/auth';
import prisma from '@/prisma/database';
import type { ExceptionAccessLevel, UserRole } from '@prisma/client';

// GET - Obtener todas las excepciones de usuario
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Verificar que el usuario sea admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [exceptions, total] = await Promise.all([
      prisma.userException.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userException.count({ where })
    ]);

    return NextResponse.json({
      exceptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user exceptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva excepción de usuario
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Verificar que el usuario sea admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      email,
      accessLevel,
      bypassDomainCheck,
      allowedRoutes,
      startDate,
      endDate,
      startTime,
      endTime,
      daysOfWeek,
      temporaryTeams,
      temporaryRole,
      reason,
      description,
      isTemporary
    } = body;

    // Validaciones básicas
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verificar que el email no tenga ya una excepción
    const existingException = await prisma.userException.findUnique({
      where: { email }
    });

    if (existingException) {
      return NextResponse.json(
        { error: 'Exception already exists for this email' },
        { status: 409 }
      );
    }

    // Crear la excepción
    const exception = await prisma.userException.create({
      data: {
        email,
        accessLevel: accessLevel || ExceptionAccessLevel.CUSTOM,
        bypassDomainCheck: bypassDomainCheck || false,
        allowedRoutes: allowedRoutes || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        startTime,
        endTime,
        daysOfWeek: daysOfWeek || [],
        temporaryTeams: temporaryTeams || [],
        temporaryRole,
        reason,
        description,
        isTemporary: isTemporary || false,
        createdBy: session.user.email,
        isActive: true
      }
    });

    return NextResponse.json(exception, { status: 201 });

  } catch (error) {
    console.error('Error creating user exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar excepción existente
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    // Verificar que el usuario sea admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Exception ID is required' },
        { status: 400 }
      );
    }

    // Convertir fechas si existen
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const exception = await prisma.userException.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(exception);

  } catch (error) {
    console.error('Error updating user exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar excepción
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    // Verificar que el usuario sea admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Exception ID is required' },
        { status: 400 }
      );
    }

    await prisma.userException.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Exception deleted successfully' });

  } catch (error) {
    console.error('Error deleting user exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}