import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    // Si parentId es 'root', buscar páginas sin padre
    const siblings = await prisma.dynamicPage.findMany({
      where: {
        parentId: parentId === "root" ? null : parentId,
      },
      orderBy: {
        order: "desc",
      },
      take: 1,
    });

    const maxOrder = siblings.length > 0 ? siblings[0].order : -1;
    return NextResponse.json({ maxOrder });
  } catch (error) {
    console.error("Error getting max order:", error);
    return NextResponse.json(
      { error: "Failed to get max order" },
      { status: 500 }
    );
  }
}
