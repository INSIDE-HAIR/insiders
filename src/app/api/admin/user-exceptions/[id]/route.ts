import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/config/auth/auth';
import prisma from '@/prisma/database';

// GET - Obtener excepción específica
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    
    // Verificar que el usuario sea admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exception = await prisma.userException.findUnique({
      where: { id: params.id }
    });

    if (!exception) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(exception);

  } catch (error) {
    console.error('Error fetching user exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar campos específicos de una excepción
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    
    // Verificar que el usuario sea admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Convertir fechas si existen
    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }

    const exception = await prisma.userException.update({
      where: { id: params.id },
      data: {
        ...body,
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

// DELETE - Eliminar excepción específica
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    
    // Verificar que el usuario sea admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.userException.delete({
      where: { id: params.id }
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

// POST - Usar excepción (incrementar contador de uso)
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const exception = await prisma.userException.update({
      where: { id: params.id },
      data: {
        lastUsed: new Date(),
        useCount: { increment: 1 }
      }
    });

    return NextResponse.json({ 
      message: 'Exception usage recorded',
      useCount: exception.useCount 
    });

  } catch (error) {
    console.error('Error recording exception usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}