import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Template } from "@prisma/client";

import * as z from "zod";

const prisma = new PrismaClient();

const PageSchema = z.object({
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  lang: z.string(),
  parentId: z.string().nullable(),
  level: z.number().optional(),
  isPublished: z.boolean(),
  author: z.string(),
  template: z.nativeEnum(Template).default(Template.sideMenuAndTabs),
});

const PageUpdateSchema = PageSchema.extend({ id: z.string() });

// Helper function to generate fullPath
async function generateFullPath(
  slug: string,
  parentId: string | null
): Promise<string> {
  if (!parentId || parentId === "root") return slug;
  const parent = await prisma.dynamicPage.findUnique({
    where: { id: parentId },
    select: { fullPath: true },
  });
  if (!parent) throw new Error("Parent page not found");
  return `${parent.fullPath}/${slug}`;
}

// GET method to fetch pages
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const isPublished = searchParams.get("isPublished") === "true";

  try {
    // Descomponer la búsqueda en palabras clave
    const searchKeywords = search
      .split(" ")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword);

    // Construir condiciones de búsqueda dinámicamente
    const searchConditions = searchKeywords.map((keyword) => ({
      OR: [
        { title: { contains: keyword, mode: "insensitive" as const } },
        { fullPath: { contains: keyword, mode: "insensitive" as const } },
      ],
    }));

    const whereCondition = {
      AND: [
        ...searchConditions,
        ...(isPublished ? [{ isPublished: true }] : []),
      ],
    };

    // Buscar las páginas que coincidan con las condiciones
    const matchedPages = await prisma.dynamicPage.findMany({
      where: whereCondition,
      orderBy: {
        level: "asc",
      },
    });

    // Obtener los padres de las páginas coincidentes
    const parentIds = matchedPages
      .map((page) => page.parentId)
      .filter((id) => id !== null);

    const parentPages = await prisma.dynamicPage.findMany({
      where: {
        id: { in: parentIds },
      },
    });

    // Combinar las páginas coincidentes con sus padres
    const allPages = [...matchedPages, ...parentPages];

    return NextResponse.json(allPages, { status: 200 });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 400 }
    );
  }
}

// POST method to create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = PageSchema.parse(body);
    const fullPath = await generateFullPath(data.slug, data.parentId);
    const newPage = await prisma.dynamicPage.create({
      data: {
        title: data.title,
        content: JSON.stringify({ body: data.content }),
        slug: data.slug,
        lang: data.lang,
        fullPath: fullPath,
        parentId: data.parentId === "root" ? null : data.parentId,
        level: data.level || 1,
        isPublished: data.isPublished,
        author: data.author,
        template: data.template,
      },
    });
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 400 }
    );
  }
}

// PUT method to update an existing page
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = PageUpdateSchema.parse(body);

    // Check if the page is editable
    const existingPage = await prisma.dynamicPage.findUnique({
      where: { id: data.id },
    });

    if (!existingPage) {
      throw new Error("Page not found");
    }

    if (!existingPage.isEditable) {
      return NextResponse.json(
        {
          error:
            "Esta página no se puede editar. Por favor, contacta al Desarrollador de la web.",
        },
        { status: 403 }
      );
    }

    let updatedPageData: any = {
      title: data.title,
      content: JSON.stringify({ body: data.content }),
      slug: data.slug,
      lang: data.lang,
      isPublished: data.isPublished,
      author: data.author,
      template: data.template,
    };

    if (data.parentId === null || data.parentId === "root") {
      updatedPageData.parentId = null;
      updatedPageData.level = 1;
      updatedPageData.fullPath = data.slug;
    } else {
      const parentPage = await prisma.dynamicPage.findUnique({
        where: { id: data.parentId },
      });
      if (!parentPage) throw new Error("Parent page not found");

      updatedPageData.parentId = data.parentId;
      updatedPageData.level = parentPage.level + 1;
      updatedPageData.fullPath = `${parentPage.fullPath}/${data.slug}`;
    }

    const updatedPage = await prisma.dynamicPage.update({
      where: { id: data.id },
      data: updatedPageData,
    });

    return NextResponse.json(updatedPage, { status: 200 });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 400 }
    );
  }
}

// DELETE method to delete a page
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const deleteOption = url.searchParams.get("deleteOption");

    if (!id) {
      throw new Error("Page ID is required");
    }

    const pageToDelete = await prisma.dynamicPage.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!pageToDelete) {
      throw new Error("Page not found");
    }

    if (!pageToDelete.isEditable) {
      return NextResponse.json(
        {
          error:
            "Esta página no se puede eliminar. Por favor, contacta al Desarrollador de la web.",
        },
        { status: 403 }
      );
    }

    if (pageToDelete.children.length > 0) {
      if (!deleteOption) {
        return NextResponse.json(
          {
            message: "Page has children",
            childCount: pageToDelete.children.length,
          },
          { status: 409 }
        );
      }

      if (deleteOption === "cascade") {
        await prisma.dynamicPage.deleteMany({
          where: {
            OR: [
              { id: id },
              { fullPath: { startsWith: pageToDelete.fullPath + "/" } },
            ],
          },
        });
      } else if (deleteOption === "moveUp") {
        await prisma.$transaction(async (prisma) => {
          for (const child of pageToDelete.children) {
            await prisma.dynamicPage.update({
              where: { id: child.id },
              data: {
                parentId: pageToDelete.parentId,
                fullPath: child.fullPath.replace(
                  `${pageToDelete.fullPath}/`,
                  ""
                ),
                level: child.level - 1,
              },
            });
          }
          await prisma.dynamicPage.delete({ where: { id } });
        });
      }
    } else {
      await prisma.dynamicPage.delete({ where: { id } });
    }

    return NextResponse.json(
      { message: "Page deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 400 }
    );
  }
}
