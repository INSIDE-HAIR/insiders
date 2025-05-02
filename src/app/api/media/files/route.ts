import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/prisma/database";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Configuración de la ruta como dinámica para evitar la generación estática
// debido al uso de headers en la petición
export const dynamic = "force-dynamic";

const querySchema = z.object({
  folderId: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener y validar parámetros de query
    const { searchParams } = new URL(req.url);
    const params = querySchema.parse({
      folderId: searchParams.get("folderId"),
      type: searchParams.get("type"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    // Construir where clause
    const where: Prisma.MediaWhereInput = {
      ...(params.folderId && { folderId: params.folderId }),
      ...(params.type && { type: params.type }),
      ...(params.search && {
        OR: [
          {
            filename: {
              contains: params.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            title: {
              contains: params.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: params.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          { tags: { hasSome: [params.search] } },
        ],
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

    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
