import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/prisma/database";
import { z } from "zod";

// Schema de validación para crear carpeta
const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
  slug: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    // Buscar carpetas
    const folders = await prisma.folder.findMany({
      where: {
        parentId: parentId || null,
        owner: { id: session.user.id },
      },
      include: {
        _count: {
          select: {
            children: true,
            medias: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createFolderSchema.parse(body);

    // Verificar si ya existe una carpeta con el mismo nombre en el mismo nivel
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: validatedData.name,
        parentId: validatedData.parentId || null,
        owner: { id: session.user.id },
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: "Ya existe una carpeta con ese nombre" },
        { status: 400 }
      );
    }

    // Crear la carpeta
    const folder = await prisma.folder.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        parentId: validatedData.parentId,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
