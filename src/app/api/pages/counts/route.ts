import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PageStatus, Prisma } from "@prisma/client";

// Configuración de la ruta como dinámica para evitar la generación estática
// debido al uso de request.url
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// GET method to fetch page counts by status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

    // Base query filter with correct types for Prisma
    const baseWhereInput: Prisma.DynamicPageWhereInput = {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { fullPath: { contains: search, mode: "insensitive" } },
      ],
      ...(tags.length > 0 ? { tags: { hasSome: tags } } : {}),
    };

    // Get counts for each status with explicitly typed status
    const publishedCount = await prisma.dynamicPage.count({
      where: {
        ...baseWhereInput,
        status: "published" as PageStatus,
      },
    });

    const draftCount = await prisma.dynamicPage.count({
      where: {
        ...baseWhereInput,
        status: "draft" as PageStatus,
      },
    });

    const deletedCount = await prisma.dynamicPage.count({
      where: {
        ...baseWhereInput,
        status: "deleted" as PageStatus,
      },
    });

    return NextResponse.json({
      published: publishedCount,
      draft: draftCount,
      deleted: deletedCount,
    });
  } catch (error) {
    console.error("Error fetching page counts:", error);
    return NextResponse.json(
      { error: "Error fetching page counts" },
      { status: 500 }
    );
  }
}
