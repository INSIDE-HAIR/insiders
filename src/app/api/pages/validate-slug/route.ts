import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { baseSlug, parentId, excludeId } = await request.json();

    // Función para generar el slug con el sufijo apropiado
    const generateSlugWithSuffix = (
      base: string,
      status: string,
      pageId?: string
    ) => {
      switch (status) {
        case "draft":
          return `${pageId}-draft`;
        case "deleted":
          return `${pageId}-deleted`;
        case "published":
          return base;
        default:
          return base;
      }
    };

    // Buscar páginas existentes con slug similar
    const existingPages = await prisma.dynamicPage.findMany({
      where: {
        AND: [
          {
            parentId: parentId === "root" ? null : parentId,
          },
          {
            status: "published",
          },
          {
            id: { not: excludeId }, // Excluir la página actual en caso de edición
          },
          {
            slug: {
              startsWith: baseSlug,
            },
          },
        ],
      },
      orderBy: {
        slug: "asc",
      },
    });

    // Si no hay páginas existentes, retornar el slug base
    if (existingPages.length === 0) {
      return NextResponse.json({ slug: baseSlug });
    }

    // Encontrar el siguiente número disponible para el slug
    const copyRegex = new RegExp(`^${baseSlug}(?:-copy(?:-(\\d+))?)?$`);
    let maxNumber = 0;

    existingPages.forEach((page) => {
      const match = page.slug.match(copyRegex);
      if (match) {
        const num = match[1]
          ? parseInt(match[1])
          : match[0].endsWith("-copy")
          ? 1
          : 0;
        maxNumber = Math.max(maxNumber, num);
      }
    });

    // Generar el nuevo slug
    const newSlug =
      maxNumber === 0
        ? `${baseSlug}-copy`
        : `${baseSlug}-copy-${maxNumber + 1}`;

    return NextResponse.json({ slug: newSlug });
  } catch (error) {
    console.error("Error validating slug:", error);
    return NextResponse.json(
      { error: "Failed to validate slug" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
