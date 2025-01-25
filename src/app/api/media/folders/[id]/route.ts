import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/prisma/database";
import { z } from "zod";

const updateFolderSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
      include: {
        children: true,
        medias: true,
        _count: {
          select: {
            children: true,
            medias: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateFolderSchema.parse(body);

    // Verificar si existe la carpeta
    const existingFolder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Verificar si ya existe otra carpeta con el mismo nombre en el mismo nivel
    if (validatedData.name) {
      const duplicateFolder = await prisma.folder.findFirst({
        where: {
          name: validatedData.name,
          parentId: existingFolder.parentId,
          id: { not: params.id },
        },
      });

      if (duplicateFolder) {
        return NextResponse.json(
          { error: "A folder with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Actualizar la carpeta
    const updatedFolder = await prisma.folder.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar si existe la carpeta
    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
      include: {
        children: true,
        medias: true,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Verificar si la carpeta está vacía
    if (folder.children.length > 0 || folder.medias.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete non-empty folder" },
        { status: 400 }
      );
    }

    // Eliminar la carpeta
    await prisma.folder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
