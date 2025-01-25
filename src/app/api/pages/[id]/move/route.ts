import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Función para obtener el orden máximo entre hermanos
async function getMaxSiblingOrder(parentId: string | null): Promise<number> {
  const maxOrderPage = await prisma.dynamicPage.findFirst({
    where: { parentId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return maxOrderPage?.order ?? -1;
}

// Función para reordenar hermanos secuencialmente
async function reorderSiblings(parentId: string | null) {
  const siblings = await prisma.dynamicPage.findMany({
    where: { parentId },
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < siblings.length; i++) {
    await prisma.dynamicPage.update({
      where: { id: siblings[i].id },
      data: { order: i },
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id;
    const body = await request.json();
    const { action, targetParentId } = body;

    // Verificar si la página existe
    const currentPage = await prisma.dynamicPage.findUnique({
      where: { id: pageId },
      include: {
        parent: true,
      },
    });

    if (!currentPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (!currentPage.isEditable) {
      return NextResponse.json(
        { error: "Page is not editable" },
        { status: 403 }
      );
    }

    switch (action) {
      case "moveLeft": {
        // Si no tiene padre, no puede moverse a la izquierda
        if (!currentPage.parentId) {
          return NextResponse.json(
            { error: "Page is already at root level" },
            { status: 400 }
          );
        }

        // Obtener el padre del padre (abuelo)
        const grandParentId = currentPage.parent?.parentId;

        // Obtener el orden máximo en el nivel del abuelo
        const maxOrder = await getMaxSiblingOrder(
          currentPage.parent?.parentId ?? null
        );

        // Actualizar la página
        await prisma.dynamicPage.update({
          where: { id: pageId },
          data: {
            parentId: grandParentId,
            level: grandParentId ? currentPage.level - 1 : 1,
            fullPath: grandParentId
              ? `${currentPage.parent?.fullPath
                  ?.split("/")
                  .slice(0, -1)
                  .join("/")}/${currentPage.slug}`
              : currentPage.slug,
            order: maxOrder + 1,
          },
        });
        break;
      }

      case "moveRight": {
        // Obtener el hermano anterior
        const previousSibling = await prisma.dynamicPage.findFirst({
          where: {
            parentId: currentPage.parentId,
            order: { lt: currentPage.order },
          },
          orderBy: { order: "desc" },
        });

        if (!previousSibling) {
          return NextResponse.json(
            { error: "No previous sibling found to move under" },
            { status: 400 }
          );
        }

        // Obtener el orden máximo entre los hijos del hermano anterior
        const maxOrder = await getMaxSiblingOrder(previousSibling.id);

        // Actualizar la página
        await prisma.dynamicPage.update({
          where: { id: pageId },
          data: {
            parentId: previousSibling.id,
            level: currentPage.level + 1,
            fullPath: `${previousSibling.fullPath}/${currentPage.slug}`,
            order: maxOrder + 1,
          },
        });
        break;
      }

      case "moveUp": {
        // Obtener la página anterior en el mismo nivel
        const previousPage = await prisma.dynamicPage.findFirst({
          where: {
            parentId: currentPage.parentId,
            order: { lt: currentPage.order },
          },
          orderBy: { order: "desc" },
        });

        if (previousPage) {
          // Intercambiar órdenes
          await prisma.$transaction([
            prisma.dynamicPage.update({
              where: { id: currentPage.id },
              data: { order: previousPage.order },
            }),
            prisma.dynamicPage.update({
              where: { id: previousPage.id },
              data: { order: currentPage.order },
            }),
          ]);
        }
        break;
      }

      case "moveDown": {
        // Obtener la página siguiente en el mismo nivel
        const nextPage = await prisma.dynamicPage.findFirst({
          where: {
            parentId: currentPage.parentId,
            order: { gt: currentPage.order },
          },
          orderBy: { order: "asc" },
        });

        if (nextPage) {
          // Intercambiar órdenes
          await prisma.$transaction([
            prisma.dynamicPage.update({
              where: { id: currentPage.id },
              data: { order: nextPage.order },
            }),
            prisma.dynamicPage.update({
              where: { id: nextPage.id },
              data: { order: currentPage.order },
            }),
          ]);
        }
        break;
      }

      case "makeRoot": {
        // Actualizar la página para hacerla raíz
        await prisma.dynamicPage.update({
          where: { id: pageId },
          data: {
            parentId: null,
            level: 1,
            fullPath: currentPage.slug,
            order: (await getMaxSiblingOrder(null)) + 1,
          },
        });
        break;
      }

      case "moveTo": {
        if (targetParentId === pageId) {
          return NextResponse.json(
            { error: "Cannot move a page under itself" },
            { status: 400 }
          );
        }

        let newParentId = targetParentId;
        if (targetParentId === "root") {
          newParentId = null;
        }

        // Si se mueve a root o a otro padre, obtener el orden máximo actual
        const maxOrder = await getMaxSiblingOrder(newParentId);

        // Actualizar la página
        if (newParentId === null) {
          await prisma.dynamicPage.update({
            where: { id: pageId },
            data: {
              parentId: null,
              level: 1,
              fullPath: currentPage.slug,
              order: maxOrder + 1,
            },
          });
        } else {
          const targetParent = await prisma.dynamicPage.findUnique({
            where: { id: newParentId },
          });

          if (!targetParent) {
            return NextResponse.json(
              { error: "Target parent not found" },
              { status: 404 }
            );
          }

          await prisma.dynamicPage.update({
            where: { id: pageId },
            data: {
              parentId: newParentId,
              level: targetParent.level + 1,
              fullPath: `${targetParent.fullPath}/${currentPage.slug}`,
              order: maxOrder + 1,
            },
          });
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Reordenar hermanos después de cualquier movimiento
    await reorderSiblings(currentPage.parentId);

    return NextResponse.json(
      { message: "Page moved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error moving page:", error);
    return NextResponse.json({ error: "Failed to move page" }, { status: 500 });
  }
}
