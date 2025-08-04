import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PageStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { searchParams } = new URL(request.url);
    const deleteOption = searchParams.get("deleteOption");
    const pageId = params.id;

    // Check if the page exists and is editable
    const page = await prisma.dynamicPage.findUnique({
      where: { id: pageId },
      include: { children: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (!page.isEditable) {
      return NextResponse.json(
        { error: "Page is not editable" },
        { status: 403 }
      );
    }

    // Si la página ya está en estado "deleted", procedemos con el borrado permanente
    if (page.status === "deleted") {
      if (page.children && page.children.length > 0) {
        if (deleteOption === "cascade") {
          // Borrado permanente de todos los hijos
          await prisma.dynamicPage.deleteMany({
            where: {
              OR: [
                { id: pageId },
                { fullPath: { startsWith: `${page.fullPath}/` } },
              ],
            },
          });
        } else if (deleteOption === "moveUp") {
          // Mover hijos arriba y borrar la página
          for (const child of page.children) {
            await prisma.dynamicPage.update({
              where: { id: child.id },
              data: {
                parentId: page.parentId,
                level: page.level,
                fullPath: child.fullPath.replace(
                  `${page.fullPath}/`,
                  page.parentId
                    ? `${page.fullPath.split("/").slice(0, -1).join("/")}/`
                    : ""
                ),
              },
            });
          }
          await prisma.dynamicPage.delete({
            where: { id: pageId },
          });
        }
      } else {
        // Borrado permanente si no tiene hijos
        await prisma.dynamicPage.delete({
          where: { id: pageId },
        });
      }
    } else {
      // Si la página no está en estado "deleted", la movemos a la papelera
      if (page.children && page.children.length > 0) {
        if (deleteOption === "cascade") {
          // Mover todos los hijos a la papelera
          await prisma.dynamicPage.updateMany({
            where: {
              OR: [
                { id: pageId },
                { fullPath: { startsWith: `${page.fullPath}/` } },
              ],
            },
            data: { status: "deleted" as PageStatus },
          });
        } else if (deleteOption === "moveUp") {
          // Mover hijos arriba y mover la página a la papelera
          for (const child of page.children) {
            await prisma.dynamicPage.update({
              where: { id: child.id },
              data: {
                parentId: page.parentId,
                level: page.level,
                fullPath: child.fullPath.replace(
                  `${page.fullPath}/`,
                  page.parentId
                    ? `${page.fullPath.split("/").slice(0, -1).join("/")}/`
                    : ""
                ),
              },
            });
          }
          await prisma.dynamicPage.update({
            where: { id: pageId },
            data: { status: "deleted" as PageStatus },
          });
        }
      } else {
        // Mover a la papelera si no tiene hijos
        await prisma.dynamicPage.update({
          where: { id: pageId },
          data: { status: "deleted" as PageStatus },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
