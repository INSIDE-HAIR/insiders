import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { auth } from "../../../../../../config/auth/auth";
import { z } from "zod";

const toggleSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = toggleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { isActive } = validationResult.data;

    const updatedRoute = await prisma.driveRoute.update({
      where: { id: params.id },
      data: { isActive },
    });

    // Registrar el cambio en el log
    await prisma.driveRouteLog.create({
      data: {
        routeId: params.id,
        operation: "update",
        success: true,
        errorMessage: `Estado cambiado a ${isActive ? "activo" : "inactivo"}`,
      },
    });

    return NextResponse.json(updatedRoute);
  } catch (error: any) {
    console.error("Error toggling route status:", error);
    return NextResponse.json(
      { error: error.message || "Error updating route status" },
      { status: 500 }
    );
  }
}
