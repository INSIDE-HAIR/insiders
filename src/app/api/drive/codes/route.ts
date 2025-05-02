import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/src/config/auth/auth";

// Configuración de la ruta como dinámica para evitar la generación estática
// debido al uso de parámetros de búsqueda (nextUrl.searchParams)
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// GET - Obtener todos los códigos o códigos filtrados por tipo
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'lang', 'file', 'client', 'campaign'

    // Filtrar por tipo si se especifica
    let codes;
    if (type) {
      codes = await prisma.code.findMany({
        where: {
          type: type,
        },
        orderBy: {
          code: "asc",
        },
      });
    } else {
      codes = await prisma.code.findMany({
        orderBy: [{ type: "asc" }, { code: "asc" }],
      });
    }

    return NextResponse.json(codes);
  } catch (error) {
    console.error("Error al obtener códigos:", error);
    return NextResponse.json(
      { error: "Error al obtener los códigos" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo código
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (solo admins pueden modificar códigos)
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Validar datos requeridos
    if (!data.type || !data.code || !data.name) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (type, code, name)" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.code.findFirst({
      where: {
        type: data.type,
        code: data.code,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un código con ese valor" },
        { status: 409 }
      );
    }

    // Crear nuevo código
    const newCode = await prisma.code.create({
      data: {
        type: data.type,
        code: data.code,
        name: data.name,
        description: data.description || null,
      },
    });

    return NextResponse.json(newCode, { status: 201 });
  } catch (error) {
    console.error("Error al crear código:", error);
    return NextResponse.json(
      { error: "Error al crear el código" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un código existente
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Validar datos requeridos
    if (!data.id || !data.type || !data.code || !data.name) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (id, type, code, name)" },
        { status: 400 }
      );
    }

    // Actualizar código
    const updatedCode = await prisma.code.update({
      where: {
        id: data.id,
      },
      data: {
        type: data.type,
        code: data.code,
        name: data.name,
        description: data.description || null,
      },
    });

    return NextResponse.json(updatedCode);
  } catch (error) {
    console.error("Error al actualizar código:", error);
    return NextResponse.json(
      { error: "Error al actualizar el código" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un código
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de código no proporcionado" },
        { status: 400 }
      );
    }

    // Eliminar código - usando string ID para MongoDB
    await prisma.code.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar código:", error);
    return NextResponse.json(
      { error: "Error al eliminar el código" },
      { status: 500 }
    );
  }
}
