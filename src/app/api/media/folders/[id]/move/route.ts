import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/prisma/database";
import { z } from "zod";

const moveFolderSchema = z.object({
  newParentId: z.string().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newParentId } = moveFolderSchema.parse(body);

    // Verificar si existe la carpeta a mover
    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Si se especifica un nuevo padre, verificar que existe
    if (newParentId) {
      const newParent = await prisma.folder.findUnique({
        where: { id: newParentId },
      });

      if (!newParent) {
        return NextResponse.json(
          { error: "Destination folder not found" },
          { status: 404 }
        );
      }

      // Verificar que no se está moviendo a una subcarpeta de sí misma
      let currentParent = newParent;
      while (currentParent.parentId) {
        if (currentParent.parentId === folder.id) {
          return NextResponse.json(
            { error: "Cannot move folder into its own subfolder" },
            { status: 400 }
          );
        }
        currentParent = (await prisma.folder.findUnique({
          where: { id: currentParent.parentId },
        })) as typeof currentParent;

        if (!currentParent) break;
      }
    }

    // Verificar si ya existe una carpeta con el mismo nombre en el destino
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: folder.name,
        parentId: newParentId,
        id: { not: folder.id },
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: "A folder with this name already exists in the destination" },
        { status: 400 }
      );
    }

    // Mover la carpeta
    const movedFolder = await prisma.folder.update({
      where: { id: params.id },
      data: { parentId: newParentId },
    });

    return NextResponse.json(movedFolder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error moving folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
