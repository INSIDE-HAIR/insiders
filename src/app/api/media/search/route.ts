import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/prisma/database";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const searchSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"]).optional(),
  folderId: z.string().optional(),
  matchAllTags: z.boolean().optional().default(false),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener y validar parámetros de búsqueda
    const { searchParams } = new URL(req.url);
    const params = searchSchema.parse({
      query: searchParams.get("query"),
      tags: searchParams.getAll("tags"),
      type: searchParams.get("type"),
      folderId: searchParams.get("folderId"),
      matchAllTags: searchParams.get("matchAllTags") === "true",
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    // Construir where clause
    const where: Prisma.MediaWhereInput = {
      ...(params.folderId && { folderId: params.folderId }),
      ...(params.type && { type: params.type }),
      // Búsqueda por texto en varios campos
      ...(params.query && {
        OR: [
          {
            filename: {
              contains: params.query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            title: {
              contains: params.query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: params.query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
      // Filtrado por etiquetas
      ...(params.tags?.length && {
        tags: params.matchAllTags
          ? { hasEvery: params.tags }
          : { hasSome: params.tags },
      }),
    };

    // Obtener total de registros
    const total = await prisma.media.count({ where });

    // Obtener archivos paginados
    const files = await prisma.media.findMany({
      where,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return NextResponse.json({
      files,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error searching files:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
