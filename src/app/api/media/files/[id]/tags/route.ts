import { NextResponse } from "next/server";
import { auth } from "@/config/auth/auth";
import prisma from "@/prisma/database";
import { z } from "zod";

const updateTagsSchema = z.object({
  tags: z.array(z.string()),
  action: z.enum(["add", "remove", "set"]),
});

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
    const { tags, action } = updateTagsSchema.parse(body);

    // Verificar si existe el archivo
    const file = await prisma.media.findUnique({
      where: { id: params.id },
      select: { tags: true },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Actualizar tags según la acción
    let updatedTags: string[];
    switch (action) {
      case "add":
        updatedTags = [...new Set([...file.tags, ...tags])];
        break;
      case "remove":
        updatedTags = file.tags.filter((tag) => !tags.includes(tag));
        break;
      case "set":
        updatedTags = tags;
        break;
    }

    // Actualizar el archivo
    const updatedFile = await prisma.media.update({
      where: { id: params.id },
      data: { tags: updatedTags },
      select: {
        id: true,
        filename: true,
        tags: true,
      },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error updating tags:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Obtener todas las etiquetas únicas
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener todos los archivos y sus etiquetas
    const files = await prisma.media.findMany({
      select: { tags: true },
    });

    // Obtener etiquetas únicas
    const uniqueTags = [...new Set(files.flatMap((file) => file.tags))].sort();

    return NextResponse.json({
      tags: uniqueTags,
      total: uniqueTags.length,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
